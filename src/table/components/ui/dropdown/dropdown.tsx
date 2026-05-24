import clsx from 'clsx';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import type { DropdownOption, DropdownProps } from './dropdown.types';
import { useDropdownPlacement } from './use-dropdown-placement';
import { useTableDirection } from '../../../table.direction';

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    aria-hidden
    className={clsx('rcta-dropdown__chevron', open && 'rcta-dropdown__chevron--open')}
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
  >
    <path
      d="M4 6l4 4 4-4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

const CheckIcon = () => (
  <svg aria-hidden fill="none" height="14" viewBox="0 0 14 14" width="14">
    <path
      d="M2.5 7.2 5.4 10 11.5 4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    />
  </svg>
);

const getOptionLabel = (option: DropdownOption) => option.title ?? option.label;

const Dropdown = ({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = 'Select…',
  emptyOption,
  ariaLabel,
  className,
  disabled = false,
  id,
}: DropdownProps) => {
  const dir = useTableDirection();
  const generatedId = useId();
  const listboxId = id ?? generatedId;
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { placement, coords, updatePosition } = useDropdownPlacement(
    open,
    triggerRef,
    menuRef,
  );

  const selectedValues = multiple
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === 'string'
      ? [value]
      : [];

  const allOptions = emptyOption ? [emptyOption, ...options] : options;

  const getDisplayLabel = () => {
    if (multiple) {
      if (!selectedValues.length) return placeholder;
      const labels = selectedValues
        .map((entry) => options.find((item) => item.value === entry))
        .filter(Boolean)
        .map((item) => getOptionLabel(item!));
      return labels.length > 2
        ? `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`
        : labels.join(', ');
    }

    if (!value) {
      return emptyOption ? getOptionLabel(emptyOption) : placeholder;
    }

    const selected = options.find((item) => item.value === value);
    return selected ? getOptionLabel(selected) : placeholder;
  };

  const close = useCallback(() => {
    setOpen(false);
    setHighlightIndex(-1);
  }, []);

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    event.stopPropagation();
    setOpen((current) => !current);
  };

  const selectOption = (option: DropdownOption) => {
    if (option.disabled) return;

    if (multiple) {
      const isSelected = selectedValues.includes(option.value);
      const next = isSelected
        ? selectedValues.filter((item) => item !== option.value)
        : [...selectedValues, option.value];
      onChange(next.length ? next : undefined);
      return;
    }

    if (emptyOption && option.value === emptyOption.value) {
      onChange(undefined);
    } else {
      onChange(option.value);
    }
    close();
  };

  useEffect(() => {
    if (!open) return;

    const handleOutside = (event: Event) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };

    // Use click (not mousedown) so opening the menu on the same gesture does not instantly close it
    document.addEventListener('click', handleOutside, true);
    return () => document.removeEventListener('click', handleOutside, true);
  }, [close, open]);

  useEffect(() => {
    if (!open) return;

    updatePosition();
    const frame = window.requestAnimationFrame(() => updatePosition());

    const selectedIndex = allOptions.findIndex((item) =>
      multiple
        ? selectedValues.includes(item.value)
        : item.value === value || (!value && emptyOption?.value === item.value),
    );
    setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);

    return () => window.cancelAnimationFrame(frame);
  }, [allOptions, emptyOption, multiple, open, selectedValues, updatePosition, value]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      triggerRef.current?.focus();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightIndex((current) => {
        let next = current + 1;
        while (next < allOptions.length && allOptions[next]?.disabled) next += 1;
        return next >= allOptions.length ? current : next;
      });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightIndex((current) => {
        let next = current - 1;
        while (next >= 0 && allOptions[next]?.disabled) next -= 1;
        return next < 0 ? current : next;
      });
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = allOptions[highlightIndex];
      if (option) selectOption(option);
    }
  };

  const menu =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            className={clsx(
              'rcta-dropdown__menu',
              `rcta-dropdown__menu--${placement}`,
            )}
            dir={dir}
            id={`${listboxId}-listbox`}
            role="listbox"
            aria-multiselectable={multiple || undefined}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            style={{
              left: coords.left,
              top: coords.top,
              width: coords.width,
              maxHeight: coords.maxHeight,
              transform: placement === 'top' ? 'translateY(-100%)' : undefined,
            }}
          >
            <ul className="rcta-dropdown__list">
              {allOptions.map((option, index) => {
                const isSelected = multiple
                  ? selectedValues.includes(option.value)
                  : emptyOption && !value
                    ? option.value === emptyOption.value
                    : option.value === value;
                const isHighlighted = index === highlightIndex;

                return (
                  <li key={`${option.value || '__empty'}-${index}`} role="presentation">
                    <button
                      className={clsx(
                        'rcta-dropdown__option',
                        isSelected && 'rcta-dropdown__option--selected',
                        isHighlighted && 'rcta-dropdown__option--highlighted',
                      )}
                      disabled={option.disabled}
                      role="option"
                      aria-selected={isSelected}
                      type="button"
                      onMouseEnter={() => setHighlightIndex(index)}
                      onClick={() => selectOption(option)}
                    >
                      <span className="rcta-dropdown__option-label">
                        {getOptionLabel(option)}
                      </span>
                      {isSelected ? (
                        <span className="rcta-dropdown__option-check">
                          <CheckIcon />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={clsx('rcta-dropdown', className)} dir={dir}>
      <button
        ref={triggerRef}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={clsx(
          'rcta-dropdown__trigger',
          open && 'rcta-dropdown__trigger--open',
          !selectedValues.length && !value && 'rcta-dropdown__trigger--placeholder',
        )}
        dir={dir}
        disabled={disabled}
        id={listboxId}
        type="button"
        onClick={toggle}
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <span className="rcta-dropdown__value">{getDisplayLabel()}</span>
        <ChevronIcon open={open} />
      </button>
      {menu}
    </div>
  );
};

export default Dropdown;

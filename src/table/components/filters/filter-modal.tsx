import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MouseEvent, ReactNode } from 'react';
import { useDialogA11y } from '../../../hooks/use-dialog-a11y';
import type { FilterModalClassNames } from '../../table.class-names';
import type { TableDirection } from '../../table.direction';
import FilterRenderer from './filter-renderer';
import type {
  FilterSchema,
  FilterSchemaValue,
  FiltersFormValues,
} from './filters-schema.types';
import { useTableLabels } from '../../table.labels';

export interface FilterModalProps {
  open: boolean;
  title?: string;
  schema: FilterSchema[];
  values?: FiltersFormValues;
  onApply: (values: FiltersFormValues) => void;
  onClose: () => void;
  renderShell?: (props: FilterModalShellProps) => ReactNode;
  classNames?: FilterModalClassNames;
  dir?: TableDirection;
}

export interface FilterModalShellProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

const FilterModal = ({
  open,
  title,
  schema,
  values = {},
  onApply,
  onClose,
  renderShell,
  classNames,
  dir = 'ltr',
}: FilterModalProps) => {
  const labels = useTableLabels();
  const modalTitle = title ?? labels.filtersModalTitle;
  const [draft, setDraft] = useState<FiltersFormValues>(values);
  const wasOpenRef = useRef(false);
  const { titleId, panelRef, handleBackdropClick } = useDialogA11y({
    open,
    onClose,
  });

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(values);
    }
    wasOpenRef.current = open;
  }, [open, values]);

  if (!open) return null;

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleBackdropClick();
    }
  };

  const content = (
    <div
      className={clsx('rcta-modal', classNames?.modalOverlay)}
      dir={dir}
      role="dialog"
      aria-labelledby={titleId}
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div
        ref={panelRef}
        className={clsx('rcta-modal__panel', classNames?.modalPanel)}
        dir={dir}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={clsx('rcta-modal__header', classNames?.modalHeader)}>
          <h2 id={titleId}>{modalTitle}</h2>
          <button
            aria-label={labels.close}
            className="rcta-icon-button rcta-modal__close"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className={clsx('rcta-modal__body', classNames?.modalBody)}>
          {schema.map((item) => (
            <FilterRenderer
              key={item.key}
              schema={item}
              value={draft[item.key]}
              onChange={(key, value) =>
                setDraft((current) => ({ ...current, [key]: value }))
              }
            />
          ))}
        </div>
        <div className={clsx('rcta-modal__footer', classNames?.modalFooter)}>
          {dir === 'rtl' ? (
            <>
              <button
                className="rcta-button rcta-button--primary"
                type="button"
                onClick={() => onApply(draft)}
              >
                {labels.modalApply}
              </button>
              <button
                className="rcta-button"
                type="button"
                onClick={() => setDraft({})}
              >
                {labels.modalClear}
              </button>
            </>
          ) : (
            <>
              <button
                className="rcta-button"
                type="button"
                onClick={() => setDraft({})}
              >
                {labels.modalClear}
              </button>
              <button
                className="rcta-button rcta-button--primary"
                type="button"
                onClick={() => onApply(draft)}
              >
                {labels.modalApply}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (renderShell) {
    return <>{renderShell({ title: modalTitle, children: content, onClose })}</>;
  }

  return typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : content;
};

export const readSchemaDefaults = (schema: FilterSchema[]) =>
  schema.reduce<FiltersFormValues>((acc, item) => {
    if (item.defaultValue !== undefined) {
      acc[item.key] = item.defaultValue as FilterSchemaValue;
    }
    return acc;
  }, {});

export default FilterModal;

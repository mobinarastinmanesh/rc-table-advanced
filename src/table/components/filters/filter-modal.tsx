import type { CSSProperties } from 'react';
import { schemaDefaults, validateFilters } from './filters.validation';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MouseEvent, ReactNode } from 'react';
import { useDialogA11y } from '../../../hooks/use-dialog-a11y';
import type { FilterModalClassNames } from '../../table.class-names';
import {
  TableDirectionProvider,
  type TableDirection,
} from '../../table.direction';
import FilterRenderer from './filter-renderer';
import type { FilterSchema, FiltersFormValues } from './filters-schema.types';
import { useTableLabels } from '../../table.labels';

export interface FilterModalProps {
  open: boolean;
  style?: CSSProperties;
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
  style,
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<FiltersFormValues>(values);
  const wasOpenRef = useRef(false);
  const { titleId, panelRef, handleBackdropClick } = useDialogA11y({
    open,
    onClose,
  });

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft({
        ...schemaDefaults(schema),
        ...Object.fromEntries(
          Object.entries(values).filter(([, value]) => value !== undefined),
        ),
      });
      setErrors({});
    }
    wasOpenRef.current = open;
  }, [open, values, schema]);

  const apply = () => {
    const nextErrors = validateFilters(schema, draft, labels);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onApply(draft);
  };

  if (!open || typeof document === 'undefined') return null;

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleBackdropClick();
    }
  };

  const content = (
    <TableDirectionProvider value={dir}>
      <div
        className={clsx('rcta-modal', classNames?.modalOverlay)}
        dir={dir}
        style={style}
        role="dialog"
        aria-labelledby={titleId}
        aria-modal="true"
        onClick={handleOverlayClick}
      >
        <div
          ref={panelRef}
          data-rcta-dialog-panel={titleId}
          tabIndex={-1}
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
                error={errors[item.key]}
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
                  onClick={apply}
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
                  onClick={apply}
                >
                  {labels.modalApply}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </TableDirectionProvider>
  );

  if (renderShell) {
    return (
      <>{renderShell({ title: modalTitle, children: content, onClose })}</>
    );
  }

  return createPortal(content, document.body);
};

export default FilterModal;

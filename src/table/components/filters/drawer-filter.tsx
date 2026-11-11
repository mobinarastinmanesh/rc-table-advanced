import type { CSSProperties } from 'react';
import { isEmptyFilterValue } from './filters.state';
import { schemaDefaults, validateFilters } from './filters.validation';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDialogA11y } from '../../../hooks/use-dialog-a11y';
import type { DrawerFilterClassNames } from '../../table.class-names';
import {
  TableDirectionProvider,
  type TableDirection,
} from '../../table.direction';
import {
  resolveDrawerPlacement,
  type DrawerPlacement,
} from '../../table.drawer-placement';
import FilterRenderer from './filter-renderer';
import type {
  FilterSchema,
  FilterSchemaValue,
  FiltersFormValues,
} from './filters-schema.types';
import { useTableLabels } from '../../table.labels';

export interface DrawerFilterGroup<T extends object = Record<string, unknown>> {
  key: string;
  title: string;
  schema: FilterSchema<T>[];
}

export interface DrawerFilterProps {
  open: boolean;
  style?: CSSProperties;
  title?: string;
  groups: DrawerFilterGroup[];
  values?: FiltersFormValues;
  autoApplyOnClear?: boolean;
  onApply: (values: FiltersFormValues) => void;
  onClose: () => void;
  classNames?: DrawerFilterClassNames;
  dir?: TableDirection;
  /** Screen edge the panel opens from. Default: `right` for `ltr`, `left` for `rtl`. */
  placement?: DrawerPlacement;
}

const hasValue = (value: FilterSchemaValue) => !isEmptyFilterValue(value);

const DrawerFilter = ({
  open,
  style,
  title,
  groups,
  values = {},
  autoApplyOnClear,
  onApply,
  onClose,
  classNames,
  dir = 'ltr',
  placement: placementProp,
}: DrawerFilterProps) => {
  const labels = useTableLabels();
  const placement = resolveDrawerPlacement(placementProp, dir);
  const drawerTitle = title ?? labels.drawerTitle;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<FiltersFormValues>(values);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const wasOpenRef = useRef(false);
  const { titleId, panelRef, handleBackdropClick } = useDialogA11y({
    open,
    onClose,
  });

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft({
        ...schemaDefaults(groups.flatMap((group) => group.schema)),
        ...Object.fromEntries(
          Object.entries(values).filter(([, value]) => value !== undefined),
        ),
      });
      setErrors({});
      setExpanded(
        groups.reduce<Record<string, boolean>>((acc, group, index) => {
          acc[group.key] = index === 0;
          return acc;
        }, {}),
      );
    }
    wasOpenRef.current = open;
  }, [groups, open, values]);

  const apply = () => {
    const nextErrors = validateFilters(
      groups.flatMap((group) => group.schema),
      draft,
      labels,
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onApply(draft);
  };

  if (!open || typeof document === 'undefined') return null;

  const clearAll = () => {
    setDraft({});
    if (autoApplyOnClear) onApply({});
  };

  return createPortal(
    <TableDirectionProvider value={dir}>
      <div
        className={clsx(
          'rcta-drawer',
          `rcta-drawer--${placement}`,
          classNames?.drawer,
        )}
        dir={dir}
        style={style}
        role="dialog"
        aria-labelledby={titleId}
        aria-modal="true"
      >
        <button
          aria-label={labels.close}
          className={clsx('rcta-drawer__overlay', classNames?.drawerOverlay)}
          type="button"
          onClick={handleBackdropClick}
        />
        <aside
          ref={panelRef}
          data-rcta-dialog-panel={titleId}
          tabIndex={-1}
          className={clsx('rcta-drawer__panel', classNames?.drawerPanel)}
          dir={dir}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className={clsx('rcta-drawer__header', classNames?.drawerHeader)}
          >
            <h2 id={titleId}>{drawerTitle}</h2>
            <button
              aria-label={labels.close}
              className="rcta-icon-button"
              type="button"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className={clsx('rcta-drawer__body', classNames?.drawerBody)}>
            {groups.map((group) => {
              const groupCount = group.schema.filter((item) =>
                hasValue(draft[item.key]),
              ).length;
              const isExpanded = expanded[group.key] ?? false;

              return (
                <section
                  key={group.key}
                  className={clsx(
                    'rcta-accordion',
                    isExpanded && 'rcta-accordion--expanded',
                    classNames?.drawerAccordion,
                  )}
                >
                  <button
                    aria-expanded={isExpanded}
                    className="rcta-accordion__trigger"
                    type="button"
                    onClick={() =>
                      setExpanded((current) => ({
                        ...current,
                        [group.key]: !(current[group.key] ?? false),
                      }))
                    }
                  >
                    <span>{group.title}</span>
                    <span className="rcta-accordion__meta">
                      {groupCount ? (
                        <span className="rcta-accordion__count">
                          {labels.drawerGroupSelectedCount(groupCount)}
                        </span>
                      ) : null}
                      <span
                        aria-hidden="true"
                        className="rcta-accordion__chevron"
                      />
                    </span>
                  </button>
                  <div hidden={!isExpanded} className="rcta-accordion__panel">
                    <div className="rcta-accordion__content">
                      {group.schema.map((item) => (
                        <FilterRenderer
                          key={item.key}
                          schema={item}
                          error={errors[item.key]}
                          value={draft[item.key]}
                          onChange={(key, value) =>
                            setDraft((current) => ({
                              ...current,
                              [key]: value,
                            }))
                          }
                        />
                      ))}
                      {groupCount ? (
                        <button
                          className="rcta-button"
                          type="button"
                          onClick={() => {
                            const next = { ...draft };
                            group.schema.forEach((item) => {
                              delete next[item.key];
                            });
                            setDraft(next);
                            if (autoApplyOnClear) onApply(next);
                          }}
                        >
                          {labels.drawerClearSection}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          <div
            className={clsx('rcta-drawer__footer', classNames?.drawerFooter)}
          >
            {dir === 'rtl' ? (
              <>
                <button
                  className="rcta-button rcta-button--primary"
                  type="button"
                  onClick={apply}
                >
                  {labels.drawerApply}
                </button>
                <button
                  className="rcta-button"
                  type="button"
                  onClick={clearAll}
                >
                  {labels.drawerClearAll}
                </button>
              </>
            ) : (
              <>
                <button
                  className="rcta-button"
                  type="button"
                  onClick={clearAll}
                >
                  {labels.drawerClearAll}
                </button>
                <button
                  className="rcta-button rcta-button--primary"
                  type="button"
                  onClick={apply}
                >
                  {labels.drawerApply}
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </TableDirectionProvider>,
    document.body,
  );
};

export default DrawerFilter;

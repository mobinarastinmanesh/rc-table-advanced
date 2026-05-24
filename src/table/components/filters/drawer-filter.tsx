import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDialogA11y } from '../../../hooks/use-dialog-a11y';
import type { DrawerFilterClassNames } from '../../table.class-names';
import type { TableDirection } from '../../table.direction';
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

export interface DrawerFilterGroup {
  key: string;
  title: string;
  schema: FilterSchema[];
}

export interface DrawerFilterProps {
  open: boolean;
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

const hasValue = (value: FilterSchemaValue) =>
  value !== undefined &&
  value !== null &&
  value !== '' &&
  !(Array.isArray(value) && value.length === 0);

const DrawerFilter = ({
  open,
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
  const [draft, setDraft] = useState<FiltersFormValues>(values);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const wasOpenRef = useRef(false);
  const { titleId, panelRef, handleBackdropClick } = useDialogA11y({
    open,
    onClose,
  });

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(values);
      setExpanded(
        groups.reduce<Record<string, boolean>>((acc, group, index) => {
          acc[group.key] = index === 0;
          return acc;
        }, {}),
      );
    }
    wasOpenRef.current = open;
  }, [groups, open, values]);

  const selectedCount = useMemo(
    () => Object.values(draft).filter(hasValue).length,
    [draft],
  );

  if (!open) return null;

  const clearAll = () => {
    setDraft({});
    if (autoApplyOnClear) onApply({});
  };

  return createPortal(
    <div
      className={clsx(
        'rcta-drawer',
        `rcta-drawer--${placement}`,
        classNames?.drawer,
      )}
      dir={dir}
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
        className={clsx('rcta-drawer__panel', classNames?.drawerPanel)}
        dir={dir}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={clsx('rcta-drawer__header', classNames?.drawerHeader)}>
          <div>
            <h2 id={titleId}>{drawerTitle}</h2>
            <span>{labels.drawerSelectedCount(selectedCount)}</span>
          </div>
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
                    <span aria-hidden="true" className="rcta-accordion__chevron" />
                  </span>
                </button>
                <div
                  aria-hidden={!isExpanded}
                  className="rcta-accordion__panel"
                >
                  <div className="rcta-accordion__content">
                    {group.schema.map((item) => (
                      <FilterRenderer
                        key={item.key}
                        schema={item}
                        value={draft[item.key]}
                        onChange={(key, value) =>
                          setDraft((current) => ({ ...current, [key]: value }))
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

        <div className={clsx('rcta-drawer__footer', classNames?.drawerFooter)}>
          {dir === 'rtl' ? (
            <>
              <button
                className="rcta-button rcta-button--primary"
                type="button"
                onClick={() => onApply(draft)}
              >
                {labels.drawerApply}
              </button>
              <button className="rcta-button" type="button" onClick={clearAll}>
                {labels.drawerClearAll}
              </button>
            </>
          ) : (
            <>
              <button className="rcta-button" type="button" onClick={clearAll}>
                {labels.drawerClearAll}
              </button>
              <button
                className="rcta-button rcta-button--primary"
                type="button"
                onClick={() => onApply(draft)}
              >
                {labels.drawerApply}
              </button>
            </>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
};

export default DrawerFilter;

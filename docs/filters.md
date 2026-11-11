# Schema-driven filters and validation

`filterModalSchema` contains modal fields. `drawerFilterGroups` contains `{ key, title, schema }` groups. Both use `FilterSchema`. Applied chips use schema labels and selected option labels, including drawer fields.

| Type                                       | Value                            |
| ------------------------------------------ | -------------------------------- |
| `SINGLE_SELECT`, `SINGLE_BADGE_SELECT`     | string                           |
| `MULTIPLE_SELECT`, `MULTIPLE_BADGE_SELECT` | string array                     |
| `AMOUNT_RANGE`                             | `{ min?: number; max?: number }` |
| `DATE_PICKER`                              | Gregorian `YYYY-MM-DD`           |
| `DATE_RANGE_PICKER`                        | `{ from?: string; to?: string }` |
| `CUSTOM`                                   | a supported `FilterSchemaValue`  |

## Common fields

Every schema has `key`, `label` and `type`. Selects require `options: { value: string; label: string; disabled?: boolean }[]`. Optional fields are `defaultValue`, `required`, `helperText`, `onChange` and `render`.

`defaultValue` initializes a dialog draft if the value is absent when opening. It does not fetch data or activate a filter before Apply. Use `initialFilters` or controlled state for initially applied values.

Modal and drawer Apply validate required fields, amount bounds and order, canonical dates, and date range order. Errors keep the dialog open and are announced via alert markup. A partially filled range is allowed unless your own custom validation requires both endpoints. Numeric `min` and `max` constrain both ends. Custom filters must validate domain-specific rules themselves.

`validateFilters(schema, values, labels)` exposes the same validation helper. Standalone field primitives emit changes; they do not submit or validate an entire form.

## Custom filter

```tsx
const schema: FilterSchema[] = [
  {
    key: 'reference',
    label: 'Reference',
    type: FilterType.CUSTOM,
    helperText: 'Exact order reference',
    render: ({ value, onChange }) => (
      <label>
        Reference
        <input
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value || undefined)}
        />
      </label>
    ),
  },
];
```

Do not call React hooks directly in a schema render callback; return a React component that owns its hooks. Arrays and range objects must be updated immutably.

## Inline composition

Use the `Filters` primitive with `otherFilters`, `filters`, `setFilters`, `applyFilter` and `changeMode`. Inline fields use the same schema renderer as dialog fields, including badge, amount and custom filters. `isLoading` renders a loading label. `children`, `headerContent`, `subTitle` and `filteredItemCount` can add content; `hasModal` and `isSubmitDisabled` control the modal trigger and submit button.

## TypeScript

`FilterSchema<MyFilters>[]` narrows schema keys to your filter model when it has explicit keys. The discriminated union narrows each field's value shape by filter type. Arbitrary index signatures allow arbitrary keys; the library does not infer an entire model from a schema or validate your API response.

## Keyboard behavior

Dropdowns support arrows, Home/End, Enter/Space, Escape, Tab dismissal and first-character navigation. Selected badges expose pressed state. Dialogs trap focus, restore the previous focus and make background body siblings inert while open. Closed drawer groups are hidden from keyboard navigation. Test your custom renderers, nested overlays and application theme with your supported browsers and assistive technology.

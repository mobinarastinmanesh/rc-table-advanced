import assert from 'node:assert/strict';
import { afterEach, test, vi } from 'vitest';
import './setup-dom.mjs';
import { createElement as h, createRef } from 'react';
import { render, cleanup, fireEvent, act } from '@testing-library/react';
import DateObjectImport from 'react-date-object';
import gregorian from 'react-date-object/calendars/gregorian';
import {
  DatePickerFilter,
  DateRangePickerFilter,
  FilterType,
  TableDirectionProvider,
} from '../../src/core.ts';
import DatePicker from '../../src/table/components/filters/components/date-picker/date-picker.tsx';
import { getCalendarSystemConfig } from '../../src/table/components/filters/components/date-picker/date-picker.constants.ts';
const boundary = vi.hoisted(() => ({
  props: null,
  picker: { isOpen: false, closeCalendar: vi.fn(), contains: vi.fn() },
  previous: vi.fn(),
  next: vi.fn(),
}));
vi.mock(
  '../../src/table/components/filters/components/date-picker/multi-date-picker.ts',
  async () => {
    const React = await import('react');
    return {
      MultiDatePicker: React.forwardRef((props, ref) => {
        boundary.props = props;
        React.useImperativeHandle(ref, () => boundary.picker);
        return React.createElement(
          'div',
          null,
          React.createElement('input', {
            id: props.id,
            'data-testid': 'picker-input',
          }),
          props.renderButton('left', boundary.previous),
          props.renderButton('right', boundary.next),
        );
      }),
    };
  },
);
const D = DateObjectImport.default ?? DateObjectImport;
const day = (value) =>
  new D({ date: value, format: 'YYYY-MM-DD', calendar: gregorian });
afterEach(() => {
  cleanup();
  boundary.picker.isOpen = false;
  vi.clearAllMocks();
});
test('single date callbacks emit canonical days and clear on empty or invalid selection', () => {
  const change = vi.fn();
  render(
    h(DatePickerFilter, {
      schema: {
        key: 'created',
        label: 'Created',
        type: FilterType.DATE_PICKER,
        calendarSystem: 'gregorian',
      },
      value: '2026-11-11',
      onChange: change,
    }),
  );
  assert.equal(boundary.props.value.format('YYYY-MM-DD'), '2026-11-11');
  for (const selection of [
    day('2026-12-01'),
    [day('2026-12-02')],
    null,
    [],
    {},
  ])
    act(() => boundary.props.onChange(selection));
  assert.deepEqual(
    change.mock.calls.map(([value]) => value),
    ['2026-12-01', '2026-12-02', undefined, undefined, undefined],
  );
});
test('changing display calendars keeps the same canonical day and callback contract', () => {
  const change = vi.fn();
  const view = render(
    h(DatePickerFilter, {
      schema: {
        key: 'created',
        label: 'Created',
        type: FilterType.DATE_PICKER,
        calendarSystems: ['gregorian', 'jalali', 'hijri'],
        format: 'DD/MM/YYYY',
      },
      value: '2026-11-11',
      onChange: change,
    }),
  );
  for (const name of ['Jalali (Persian)', 'Hijri (Islamic Lunar)']) {
    fireEvent.click(view.getByRole('combobox', { name: 'Created calendar' }));
    fireEvent.click(view.getByRole('option', { name }));
    act(() => boundary.props.onChange(boundary.props.value));
    assert.equal(change.mock.calls.at(-1)[0], '2026-11-11');
    assert.equal(boundary.props.format, 'DD/MM/YYYY');
  }
});
test('date ranges handle complete, partial, single and cleared selections', () => {
  const change = vi.fn();
  const view = render(
    h(DateRangePickerFilter, {
      schema: {
        key: 'range',
        label: 'Range',
        type: FilterType.DATE_RANGE_PICKER,
        calendarSystems: [],
      },
      value: { from: '2026-11-01', to: '2026-11-11' },
      onChange: change,
    }),
  );
  assert.equal(boundary.props.value.length, 2);
  for (const value of [
    [day('2026-11-02'), day('2026-11-12')],
    day('2026-11-03'),
    [],
    null,
  ])
    act(() => boundary.props.onChange(value));
  assert.deepEqual(
    change.mock.calls.map(([value]) => value),
    [
      { from: '2026-11-02', to: '2026-11-12' },
      { from: '2026-11-03', to: undefined },
      undefined,
      undefined,
    ],
  );
  view.rerender(
    h(DateRangePickerFilter, {
      schema: {
        key: 'range',
        label: 'Range',
        type: FilterType.DATE_RANGE_PICKER,
      },
      onChange: change,
    }),
  );
  assert.equal(boundary.props.value, undefined);
});
test('picker forwards refs, direction, placement and localized month navigation', () => {
  const ref = createRef();
  const view = render(
    h(
      TableDirectionProvider,
      { value: 'rtl' },
      h(DatePicker, { ref, calendarSystem: 'hijri' }),
    ),
  );
  assert.equal(ref.current, boundary.picker);
  assert.equal(boundary.props.calendarPosition, 'bottom-end');
  assert.equal(boundary.props.className, 'rmdp-rtl');
  fireEvent.click(view.getByRole('button', { name: 'Previous month' }));
  fireEvent.click(view.getByRole('button', { name: 'Next month' }));
  assert.equal(boundary.previous.mock.calls.length, 1);
  assert.equal(boundary.next.mock.calls.length, 1);
  view.rerender(
    h(DatePicker, { calendarPosition: 'top-start', className: 'custom' }),
  );
  assert.equal(boundary.props.calendarPosition, 'top-start');
  assert.equal(boundary.props.className, 'custom');
});
test('outside pointer handling respects picker openness and removes its listener on unmount', () => {
  const view = render(h(DatePicker));
  fireEvent.pointerDown(document.body);
  assert.equal(boundary.picker.closeCalendar.mock.calls.length, 0);
  boundary.picker.isOpen = true;
  boundary.picker.contains.mockReturnValue(true);
  fireEvent.pointerDown(view.getByTestId('picker-input'));
  assert.equal(boundary.picker.closeCalendar.mock.calls.length, 0);
  boundary.picker.contains.mockReturnValue(false);
  fireEvent.pointerDown(window);
  assert.equal(boundary.picker.closeCalendar.mock.calls.length, 0);
  fireEvent.pointerDown(document.body);
  assert.equal(boundary.picker.closeCalendar.mock.calls.length, 1);
  view.unmount();
  fireEvent.pointerDown(document.body);
  assert.equal(boundary.picker.closeCalendar.mock.calls.length, 1);
});
test('calendar config uses defensive fallback and an explicit RTL locale', () => {
  assert.equal(getCalendarSystemConfig('invalid').calendar.name, 'persian');
  assert.equal(
    getCalendarSystemConfig('gregorian', 'rtl').locale.name,
    'gregorian_fa',
  );
});

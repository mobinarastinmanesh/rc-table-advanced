import assert from 'node:assert/strict';
import { afterEach, test, vi } from 'vitest';
import './setup-dom.mjs';
import { createElement as h, useState } from 'react';
import {
  render,
  renderHook,
  cleanup,
  fireEvent,
  act,
} from '@testing-library/react';
import { Dropdown } from '../../src/index.ts';
import { readPortalTheme } from '../../src/table/table.portal.ts';
import { useDropdownPlacement } from '../../src/table/components/ui/dropdown/use-dropdown-placement.ts';
const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'disabled', label: 'Disabled', disabled: true },
  { value: 'b', label: 'Beta', title: 'Bee' },
  { value: 'c', label: 'Charlie' },
];
afterEach(cleanup);
test('single-select keyboard skips disabled choices, searches by label, clamps ends and dismisses on Tab/outside click', () => {
  const change = vi.fn();
  const view = render(
    h(Dropdown, {
      options,
      onChange: change,
      id: 'selection',
      value: 'b',
      ariaLabel: 'Choices',
    }),
  );
  const trigger = view.getByRole('combobox');
  fireEvent.keyDown(trigger, { key: 'x' });
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  fireEvent.keyDown(trigger, { key: 'ArrowUp' });
  assert.equal(
    document.getElementById(trigger.getAttribute('aria-activedescendant'))
      .textContent,
    'Bee',
  );
  fireEvent.keyDown(trigger, { key: 'ArrowUp' });
  assert.equal(
    document.getElementById(trigger.getAttribute('aria-activedescendant'))
      .textContent,
    'Alpha',
  );
  fireEvent.keyDown(trigger, { key: 'ArrowUp' });
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  assert.equal(
    document.getElementById(trigger.getAttribute('aria-activedescendant'))
      .textContent,
    'Bee',
  );
  fireEvent.keyDown(trigger, { key: 'End' });
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  assert.equal(
    document.getElementById(trigger.getAttribute('aria-activedescendant'))
      .textContent,
    'Charlie',
  );
  fireEvent.keyDown(trigger, { key: 'Home' });
  fireEvent.keyDown(trigger, { key: 'c' });
  fireEvent.keyDown(trigger, { key: 'z' });
  fireEvent.keyDown(trigger, { key: 'Enter' });
  assert.deepEqual(change.mock.calls, [['c']]);
  fireEvent.click(trigger);
  fireEvent.keyDown(trigger, { key: 'Tab' });
  assert.equal(view.queryByRole('listbox'), null);
  fireEvent.click(trigger);
  fireEvent.click(document.body);
  assert.equal(view.queryByRole('listbox'), null);
});
test('multiple selection displays title summaries and emits undefined when the final value is removed', () => {
  const change = vi.fn();
  function Controlled() {
    const [value, setValue] = useState(['a', 'b', 'c']);
    return h(Dropdown, {
      options,
      multiple: true,
      value,
      onChange: (next) => {
        setValue(next);
        change(next);
      },
    });
  }
  const view = render(h(Controlled));
  const trigger = view.getByRole('combobox');
  assert.match(trigger.textContent, /Alpha, Bee \+1/);
  fireEvent.click(trigger);
  for (const name of ['Charlie', 'Bee', 'Alpha'])
    fireEvent.click(view.getByRole('option', { name }));
  assert.equal(change.mock.calls.at(-1)[0], undefined);
  assert.match(trigger.textContent, /Select/);
  fireEvent.click(view.getByRole('option', { name: 'Alpha' }));
  assert.deepEqual(change.mock.calls.at(-1)[0], ['a']);
});
test('empty or disabled controls do not select nonexistent options and invalid selected values use placeholders', () => {
  const change = vi.fn();
  const view = render(
    h(Dropdown, {
      options: [],
      value: 'unknown',
      placeholder: 'Choose',
      onChange: change,
    }),
  );
  const trigger = view.getByRole('combobox');
  assert.match(trigger.textContent, /Choose/);
  fireEvent.keyDown(trigger, { key: ' ' });
  for (const key of ['Home', 'End', 'ArrowDown', 'ArrowUp', 'Enter'])
    fireEvent.keyDown(trigger, { key });
  assert.equal(change.mock.calls.length, 0);
  view.rerender(h(Dropdown, { options, disabled: true, onChange: change }));
  fireEvent.click(trigger);
  fireEvent.keyDown(trigger, { key: 'Enter' });
  assert.equal(change.mock.calls.length, 0);
});
test('custom portal container carries scoped CSS variables and mouse highlighting', () => {
  const container = document.createElement('div');
  document.body.append(container);
  const view = render(
    h(Dropdown, { options, onChange() {}, portalContainer: container }),
  );
  const trigger = view.getByRole('combobox');
  trigger.style.setProperty('--rcta-color-primary', 'teal');
  fireEvent.click(trigger);
  const menu = view.getByRole('listbox');
  assert.equal(menu.parentElement, container);
  assert.equal(menu.style.getPropertyValue('--rcta-color-primary'), 'teal');
  fireEvent.mouseEnter(view.getByRole('option', { name: 'Charlie' }));
  assert.match(
    view.getByRole('option', { name: 'Charlie' }).className,
    /highlighted/,
  );
  fireEvent.mouseDown(menu);
  fireEvent.click(menu);
  assert.ok(view.getByRole('listbox'));
  assert.deepEqual(readPortalTheme(null), {});
  container.remove();
});
test('placement flips above a constrained viewport and recomputes on resize and capture scroll', () => {
  const trigger = document.createElement('button'),
    menu = document.createElement('div');
  let top = 770;
  const rect = vi
    .spyOn(trigger, 'getBoundingClientRect')
    .mockImplementation(() => ({
      left: 20,
      width: 200,
      top,
      bottom: top + 20,
    }));
  Object.defineProperty(menu, 'offsetHeight', { value: 240 });
  const height = Object.getOwnPropertyDescriptor(window, 'innerHeight');
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: 800,
  });
  const triggerRef = { current: trigger },
    menuRef = { current: menu };
  const view = renderHook(() =>
    useDropdownPlacement(true, triggerRef, menuRef),
  );
  assert.equal(view.result.current.placement, 'top');
  assert.equal(view.result.current.coords.top, 764);
  top = 10;
  act(() => window.dispatchEvent(new window.Event('resize')));
  assert.equal(view.result.current.placement, 'bottom');
  assert.equal(view.result.current.coords.top, 36);
  act(() => window.dispatchEvent(new window.Event('scroll')));
  const count = rect.mock.calls.length;
  view.unmount();
  window.dispatchEvent(new window.Event('resize'));
  assert.equal(rect.mock.calls.length, count);
  Object.defineProperty(window, 'innerHeight', height);
  const empty = renderHook(() =>
    useDropdownPlacement(false, { current: null }, { current: null }),
  );
  act(() => empty.result.current.updatePosition());
  assert.equal(empty.result.current.coords.left, 0);
});

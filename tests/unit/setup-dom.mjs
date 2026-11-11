import { JSDOM } from 'jsdom';
const dom = new JSDOM(
  '<!doctype html><html><head></head><body></body></html>',
  {
    url: 'https://example.test/orders?utm_source=news#results',
    pretendToBeVisual: true,
  },
);
for (const key of [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'Element',
  'SVGElement',
  'Node',
  'MutationObserver',
  'getComputedStyle',
]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value:
      key === 'getComputedStyle'
        ? dom.window.getComputedStyle.bind(dom.window)
        : dom.window[key],
  });
}
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(
  dom.window,
);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(
  dom.window,
);
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const realComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = (element) => realComputedStyle(element);
Object.defineProperty(globalThis, 'getComputedStyle', {
  configurable: true,
  value: window.getComputedStyle,
});

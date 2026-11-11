import type { CSSProperties } from 'react';

/** Carry scoped theme tokens across a body portal without changing global CSS. */
export const readPortalTheme = (element: HTMLElement | null): CSSProperties => {
  if (!element || typeof window === 'undefined') return {};
  const computed = window.getComputedStyle(element);
  return Object.fromEntries(
    Array.from(computed)
      .filter((key) => key.startsWith('--rcta-'))
      .map((key) => [key, computed.getPropertyValue(key)]),
  ) as CSSProperties;
};

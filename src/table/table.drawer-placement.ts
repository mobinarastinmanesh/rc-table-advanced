import type { TableDirection } from './table.direction';

/** Which screen edge the filter drawer panel slides in from. */
export type DrawerPlacement = 'left' | 'right';

export const resolveDrawerPlacement = (
  placement: DrawerPlacement | undefined,
  dir: TableDirection,
): DrawerPlacement => placement ?? (dir === 'rtl' ? 'left' : 'right');

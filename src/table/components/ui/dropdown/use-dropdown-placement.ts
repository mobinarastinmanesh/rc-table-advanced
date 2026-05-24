import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

export type DropdownPlacement = 'top' | 'bottom';

export type DropdownCoords = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
};

const MENU_GAP = 6;
const VIEWPORT_PADDING = 8;
const DEFAULT_MAX_HEIGHT = 280;

export const useDropdownPlacement = (
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  menuRef: RefObject<HTMLElement | null>,
) => {
  const [placement, setPlacement] = useState<DropdownPlacement>('bottom');
  const [coords, setCoords] = useState<DropdownCoords>({
    left: 0,
    top: 0,
    width: 0,
    maxHeight: DEFAULT_MAX_HEIGHT,
  });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? DEFAULT_MAX_HEIGHT;
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
    const spaceAbove = rect.top - VIEWPORT_PADDING;
    const openUp = spaceBelow < Math.min(menuHeight, 160) && spaceAbove > spaceBelow;
    const nextPlacement: DropdownPlacement = openUp ? 'top' : 'bottom';
    const available = openUp ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(120, Math.min(DEFAULT_MAX_HEIGHT, available - MENU_GAP));

    setPlacement(nextPlacement);
    setCoords({
      left: rect.left,
      width: rect.width,
      maxHeight,
      top: openUp
        ? rect.top - MENU_GAP
        : rect.bottom + MENU_GAP,
    });
  }, [menuRef, triggerRef]);

  useLayoutEffect(() => {
    if (!open) return;

    updatePosition();
    const frame = window.requestAnimationFrame(() => updatePosition());

    const handleLayout = () => updatePosition();
    window.addEventListener('resize', handleLayout);
    window.addEventListener('scroll', handleLayout, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleLayout);
      window.removeEventListener('scroll', handleLayout, true);
    };
  }, [open, updatePosition]);

  return { placement, coords, updatePosition };
};

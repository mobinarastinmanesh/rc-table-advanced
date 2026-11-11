import { useEffect, useId, useRef } from 'react';

type UseDialogA11yOptions = {
  open: boolean;
  onClose: () => void;
  closeOnBackdrop?: boolean;
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const useDialogA11y = ({
  open,
  onClose,
  closeOnBackdrop = true,
}: UseDialogA11yOptions) => {
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusFirst = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (node) => node.tabIndex >= 0 && node.getClientRects().length > 0,
      );
      (focusable[0] ?? panel).focus();
    };

    const frame = window.requestAnimationFrame(focusFirst);
    const panel = panelRef.current;
    const siblings = Array.from(document.body.children).filter(
      (node): node is HTMLElement =>
        node instanceof HTMLElement && !node.contains(panel),
    );
    const inertValues = siblings.map((node) => node.inert);
    siblings.forEach((node) => {
      node.inert = true;
    });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (node) =>
          node.tabIndex >= 0 &&
          !node.closest('[hidden]') &&
          node.getClientRects().length > 0,
      );

      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const inOwnedPortal =
        active instanceof HTMLElement &&
        active
          .closest('[data-rcta-portal-owner]')
          ?.getAttribute('data-rcta-portal-owner') === titleId;
      if (!panel.contains(active) && !inOwnedPortal) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      siblings.forEach((node, index) => {
        node.inert = inertValues[index];
      });
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open, titleId]);

  const handleBackdropClick = () => {
    if (closeOnBackdrop) onClose();
  };

  return {
    titleId,
    panelRef,
    handleBackdropClick,
  };
};

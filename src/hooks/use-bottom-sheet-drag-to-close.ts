import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

const CLOSE_THRESHOLD_PX = 96;

type UseBottomSheetDragToCloseOptions = {
  enabled: boolean;
  onClose: () => void;
};

export function useBottomSheetDragToClose({ enabled, onClose }: UseBottomSheetDragToCloseOptions) {
  const popupRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const draggingRef = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const canStartDrag = useCallback(
    (target: EventTarget | null) => {
      const popup = popupRef.current;
      if (!popup || !enabled) {
        return false;
      }

      const element = target instanceof HTMLElement ? target : null;
      if (!element) {
        return false;
      }

      if (element.closest('[data-slot="dialog-drag-handle"]')) {
        return true;
      }

      if (element.closest('[data-slot="dialog-header"]') && popup.scrollTop <= 0) {
        return true;
      }

      return false;
    },
    [enabled],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!canStartDrag(event.target)) {
        return;
      }

      draggingRef.current = true;
      setIsDragging(true);
      startYRef.current = event.clientY;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [canStartDrag],
  );

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) {
      return;
    }

    setDragOffset(Math.max(0, event.clientY - startYRef.current));
  }, []);

  const finishDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) {
        return;
      }

      draggingRef.current = false;
      setIsDragging(false);

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      const delta = event.clientY - startYRef.current;
      setDragOffset(0);

      if (delta >= CLOSE_THRESHOLD_PX) {
        onClose();
      }
    },
    [onClose],
  );

  return {
    popupRef,
    dragOffset,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp: finishDrag,
    onPointerCancel: finishDrag,
  };
}

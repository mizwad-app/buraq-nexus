import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface SwipeBackOptions {
  threshold?: number;
  edgeWidth?: number;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

export const useSwipeBack = (options: SwipeBackOptions = {}) => {
  const { threshold = 100, edgeWidth = 30 } = options;
  const navigate = useNavigate();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      // Only trigger if touch starts from left edge
      if (touch.clientX <= edgeWidth) {
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
        isSwiping.current = true;
        options.onSwipeStart?.();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping.current || touchStartX.current === null) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = Math.abs(touch.clientY - (touchStartY.current || 0));
      
      // Cancel if vertical movement is too large (scrolling)
      if (deltaY > 50) {
        isSwiping.current = false;
        return;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwiping.current || touchStartX.current === null) {
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX.current;

      if (deltaX > threshold) {
        navigate(-1);
      }

      touchStartX.current = null;
      touchStartY.current = null;
      isSwiping.current = false;
      options.onSwipeEnd?.();
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [navigate, threshold, edgeWidth, options]);
};

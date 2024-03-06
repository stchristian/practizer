import { requireRef } from "@/app/utils";
import React, { useCallback, useEffect, useState } from "react";

/**
 * Auto scrolling on the container element of the audio track.
 * When the position line reaches the edge of the screen, the container will automatically scroll, so the position line
 * remains always visible.
 */
export function useAutoScroll({ containerRef }: { containerRef: React.RefObject<HTMLElement> }) {
  const [userScrolled, setUserScrolled] = useState(false);

  const scrollForward = useCallback(() => {
    const container = requireRef(containerRef);

    const remainingScrollWidth = container.scrollWidth - window.innerWidth - container.scrollLeft;
    container.dataset.autoScrolling = "true";
    container.scrollBy({
      left: Math.min(window.innerWidth / 2, remainingScrollWidth),
    });
  }, [containerRef]);

  /**
   * React does not support onScrollEnd listener, so it is manually attached.
   */
  useEffect(() => {
    function handleScrollEnd(this: HTMLElement, ev: Event) {
      if (this.dataset.autoScrolling === "true") {
        delete this.dataset.autoScrolling;
      }
    }

    let container: HTMLElement | null = null;

    if (typeof window !== "undefined") {
      container = requireRef(containerRef);
      container.addEventListener("scrollend", handleScrollEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener("scrollend", handleScrollEnd);
      }
    };
  }, [containerRef]);

  const handleScroll: React.UIEventHandler<HTMLElement> = useCallback((e) => {
    if (e.currentTarget.dataset.autoScrolling !== "true") {
      setUserScrolled(true);
    }
  }, []);

  return { scrollForward, handleScroll, userScrolled };
}

import { useCallback, useEffect, useRef, useState } from "react";

const SCROLL_THRESHOLD_PX = 100;

export function usePositionLineController({ onSeek }: { onSeek: (percentage: number) => void }) {
  const positionLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [seeking, setSeeking] = useState(false);
  const scrollNeeded = useRef(false);
  const userScrolling = useRef(false);

  const scrollForward = useCallback(() => {
    if (scrollNeeded.current) {
      containerRef.current!.scrollBy({
        left: 50,
        behavior: "smooth",
      });
      containerRef.current!.addEventListener("scrollend", () => {
        scrollForward();
      });
    }
  }, []);

  // TODO: When the user scrolls, bypass auto scrolling.
  // useEffect(() => {
  //   function handleScrollEnd(this: HTMLDivElement, ev: Event) {
  //     userScrolling.current = false;
  //     delete this.dataset.autoScrolling;
  //   }

  //   let ref: HTMLDivElement | null = null;
  //   if (typeof window !== "undefined") {
  //     ref = containerRef.current;
  //     console.log("REGISTER SCROLLEND", ref);
  //     ref!.addEventListener("scrollend", handleScrollEnd);
  //   }
  //   return () => {
  //     if (ref) {
  //       console.log("REMOVE");
  //       ref.removeEventListener("scrollend", handleScrollEnd);
  //     }
  //   };
  // }, [containerRef]);

  const handleMouseMove = useCallback((ev: MouseEvent) => {
    positionLineRef.current!.style.left = `${containerRef.current!.scrollLeft + ev.clientX}px`;

    // TODO scroll when user moves marker close to the left/right edge of the screen
    // if (ev.clientX > window.innerWidth - SCROLL_THRESHOLD_PX && !scrollNeeded.current) {
    //   scrollNeeded.current = true;
    //   scrollForward();
    // } else if (scrollNeeded.current) {
    //   scrollNeeded.current = false;
    // }
  }, []);

  const handleMouseDown = useCallback((ev: MouseEvent) => {
    setSeeking(true);
  }, []);

  const handleMouseUp = useCallback(
    (ev: MouseEvent) => {
      setSeeking(false);
      const finalX = containerRef.current!.scrollLeft + ev.clientX;
      positionLineRef.current!.style.left = `${finalX}px`;
      onSeek(finalX / containerRef.current!.scrollWidth);
    },
    [onSeek]
  );

  useEffect(() => {
    let registered = false;
    if (seeking) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      registered = true;
    }

    return () => {
      if (registered) {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [seeking, handleMouseMove, handleMouseUp]);

  const loadPositionLine = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element) return;
      element.addEventListener("mousedown", handleMouseDown);
      positionLineRef.current = element;
    },
    [handleMouseDown]
  );

  const isCloseToRightEdgeOfScreen = useCallback((x: number) => {
    return x > window.innerWidth - SCROLL_THRESHOLD_PX;
  }, []);

  return {
    loadPositionLine,
    isCloseToRightEdgeOfScreen,
    containerRef,
  };
}

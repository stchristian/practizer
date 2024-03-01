"use client";

import { AudioWaveform } from "@/app/components/AudioWaveform";
import PositionLine from "@/app/components/PositionLine";
import { usePositionLineController } from "@/app/components/usePositionLineController";
import React, { useCallback, useImperativeHandle, useMemo, useRef } from "react";

const minutePerScreenWidth = 0.5;

type AudioTrackProps = {
  onSeek: (to: number) => void;
  buffer: AudioBuffer;
};

export type AudioTrackRef = {
  animatePositionLine: (elapsed: number) => void;
  reset: () => void;
};

function requireRef<T>(ref: React.MutableRefObject<T> | React.RefObject<T>) {
  if (!ref.current) {
    throw new Error(`ref.current has no value.`);
  }
  return ref.current;
}

export const AudioTrack = React.forwardRef<AudioTrackRef, AudioTrackProps>(({ onSeek, buffer }, ref) => {
  const positionLineRef = useRef<HTMLDivElement | null>(null);
  const userScrolling = useRef(false);

  const duration = buffer.duration;

  const waveformWidth = useMemo(() => ((duration / 60) * window.innerWidth) / minutePerScreenWidth, [duration]);
  const waveformHeight = 200;

  const { loadPositionLine, containerRef, isCloseToRightEdgeOfScreen } = usePositionLineController({
    onSeek(percentage) {
      const to = duration * percentage;
      onSeek(to);
    },
  });

  const scrollForward = useCallback(() => {
    const container = requireRef(containerRef);

    const remainingScrollWidth = container.scrollWidth - window.innerWidth - container.scrollLeft;
    container.dataset.autoScrolling = "true";
    container.scrollBy({
      left: Math.min(window.innerWidth / 2, remainingScrollWidth),
    });
  }, [containerRef]);

  const isItScrolledToTheEnd = useCallback(() => {
    const container = requireRef(containerRef);

    const scrollableWidth = container.scrollWidth - window.innerWidth;
    return container.scrollLeft >= scrollableWidth;
  }, [containerRef]);

  const animatePositionLine = useCallback(
    (elapsed: number) => {
      const container = requireRef(containerRef);
      const positionLine = requireRef(positionLineRef);

      const positionLineOffset = container.scrollWidth * (elapsed / duration);
      const viewportX = positionLine.getBoundingClientRect().left;

      if (isCloseToRightEdgeOfScreen(viewportX) && !userScrolling.current && !isItScrolledToTheEnd()) {
        scrollForward();
      }

      positionLine.style.left = `${positionLineOffset}px`;
    },
    [containerRef, duration, scrollForward, isItScrolledToTheEnd, isCloseToRightEdgeOfScreen]
  );

  const handleDoubleClick: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const positionLine = requireRef(positionLineRef);

      positionLine.style.left = `${e.nativeEvent.offsetX}px`;
      onSeek((e.nativeEvent.offsetX / e.currentTarget!.scrollWidth) * duration);
    },
    [onSeek, duration]
  );

  useImperativeHandle(
    ref,
    () => {
      return {
        animatePositionLine,
        reset: () => {
          const positionLine = requireRef(positionLineRef);
          positionLine.style.left = "0px";
        },
      };
    },
    [animatePositionLine]
  );

  return (
    <div
      className="relative bg-slate-200 overflow-scroll max-w-full"
      ref={containerRef}
      onDoubleClick={handleDoubleClick}
      onScroll={(e) => {
        if (e.currentTarget.dataset.autoScrolling !== "true") {
          userScrolling.current = true;
        }
      }}
    >
      <AudioWaveform audioBuffer={buffer} width={waveformWidth} height={waveformHeight} />
      <div className="absolute top-0 bottom-0 overflow-hidden" style={{ width: waveformWidth }}>
        <PositionLine
          ref={(r) => {
            positionLineRef.current = r;
            loadPositionLine(r);
          }}
        />
      </div>
    </div>
  );
});

AudioTrack.displayName = "AudioTrack";

"use client";

import { AudioWaveform } from "@/app/components/AudioWaveform";
import PositionLine from "@/app/components/PositionLine";
import { useAutoScroll } from "@/app/components/useAutoScroll";
import { usePositionLineController } from "@/app/components/usePositionLineController";
import { requireRef } from "@/app/utils";
import React, { useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";

const minutePerScreenWidth = 0.5;

type AudioTrackProps = {
  onSeek: (to: number) => void;
  buffer: AudioBuffer;
  zoomLevel?: number;
};

export type AudioTrackRef = {
  animatePositionLine: (elapsed: number) => void;
  reset: () => void;
};

export const AudioTrack = React.forwardRef<AudioTrackRef, AudioTrackProps>(({ onSeek, buffer, zoomLevel = 1 }, ref) => {
  const positionLineRef = useRef<HTMLDivElement | null>(null);
  const duration = buffer.duration;

  const waveformWidth = useMemo(
    () => (((duration / 60) * window.innerWidth) / minutePerScreenWidth) * zoomLevel,
    [duration, zoomLevel]
  );
  const waveformHeight = 200;

  const { loadPositionLine, containerRef, isCloseToRightEdgeOfScreen } = usePositionLineController({
    onSeek(percentage) {
      const to = duration * percentage;
      onSeek(to);
    },
  });

  const { scrollForward, userScrolled, handleScroll } = useAutoScroll({ containerRef });

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

      if (isCloseToRightEdgeOfScreen(viewportX) && !userScrolled && !isItScrolledToTheEnd()) {
        scrollForward();
      }

      positionLine.style.left = `${positionLineOffset}px`;
    },
    [containerRef, duration, scrollForward, isItScrolledToTheEnd, isCloseToRightEdgeOfScreen, userScrolled]
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
      className="relative border-y border-gray-800 overflow-scroll max-w-full"
      ref={containerRef}
      onDoubleClick={handleDoubleClick}
      onScroll={handleScroll}
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

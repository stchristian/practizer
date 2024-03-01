import React, { useRef } from "react";

type Second = number;

type TimeDisplayProps = {
  precision?: Second;
  duration: Second;
};

export type TimeDisplayRef = {
  updateCurrentTime(time: Second): void;
};

const formatTime = (time: Second, precision: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const returnedSeconds = seconds < 10 ? `0${seconds.toFixed(precision)}` : `${seconds.toFixed(precision)}`;
  return `${minutes}:${returnedSeconds}`;
};

export const TimeDisplay = React.forwardRef<TimeDisplayRef, TimeDisplayProps>(({ precision = 2, duration }, ref) => {
  const currentTimeRef = useRef<HTMLSpanElement>(null);

  React.useImperativeHandle(ref, () => ({
    updateCurrentTime(time) {
      currentTimeRef.current!.textContent = formatTime(time, precision);
    },
  }));

  return (
    <div>
      <span ref={currentTimeRef}>{formatTime(0, precision)}</span>
      <span> / </span>
      <span>{formatTime(duration, precision)}</span>
    </div>
  );
});

TimeDisplay.displayName = "TimeDisplay";

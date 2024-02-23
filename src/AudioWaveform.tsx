"use client";

import { useEffect, useRef } from "react";

interface AudioWaveformProps {
  audioBuffer: AudioBuffer;
}

export const rose = "#ed21d5";

const initialWidthPerMinute = 1000;

export function AudioWaveform({ audioBuffer }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initialWidth = (audioBuffer.duration / 60) * initialWidthPerMinute;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    console.log(width, height);
    const canvasCtx = canvas.getContext("2d")!;
    const buffer = audioBuffer.getChannelData(0);
    canvasCtx.clearRect(0, 0, width, height);
    canvasCtx.beginPath();
    canvasCtx.strokeStyle = rose;
    canvasCtx.lineWidth = 1;
    const step = Math.floor(buffer.length / width);
    const amp = height / 2;
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const dataIndex = i * step + j;
        if (dataIndex < buffer.length) {
          const value = buffer[dataIndex];
          if (value < min) {
            min = value;
          } else if (value > max) {
            max = value;
          }
        }
      }
      canvasCtx.moveTo(i, (1 + min) * amp);
      canvasCtx.lineTo(i, (1 + max) * amp);
    }
    canvasCtx.stroke();
  }, [audioBuffer]);

  return <canvas ref={canvasRef} width={initialWidth} height={200}></canvas>;
}

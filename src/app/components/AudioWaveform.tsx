"use client";

import { useEffect, useRef } from "react";

interface AudioWaveformProps {
  audioBuffer: AudioBuffer;
  width: number;
  height: number;
}

export const rose = "#242424"; //"#ed21d5";

function drawWaveform(canvas: HTMLCanvasElement, audioBuffer: AudioBuffer) {
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;

  const canvasWidth = cssWidth * window.devicePixelRatio;
  const canvasHeight = cssHeight * window.devicePixelRatio;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const canvasCtx = canvas.getContext("2d")!;
  const buffer = audioBuffer.getChannelData(0);

  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  canvasCtx.beginPath();
  canvasCtx.strokeStyle = rose;
  canvasCtx.lineWidth = 1;

  const step = buffer.length / canvasWidth;
  const amp = canvasHeight / 2;
  for (let i = 0; i < canvasWidth; i++) {
    let min = 1.0;
    let max = -1.0;
    for (let j = 0; j < step; j++) {
      const dataIndex = Math.floor(i * step + j);
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
}

export function AudioWaveform({ audioBuffer, width, height }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawWaveform(canvas, audioBuffer);
  }, [audioBuffer]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: width + "px",
        height: height + "px",
      }}
    >
      Audio waveform
    </canvas>
  );
}

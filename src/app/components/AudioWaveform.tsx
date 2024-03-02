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

  const halfHeight = canvasHeight / 2;
  const canvasCtx = canvas.getContext("2d")!;
  const buffer = audioBuffer.getChannelData(0);

  const vScale = 1;

  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  canvasCtx.beginPath();

  // Draws a polyline and fills it
  function drawChannelPolyline(index: number) {
    const channel = audioBuffer.getChannelData(index);
    const channelLength = channel.length;
    const sliceSize = canvasWidth / channelLength;
    canvasCtx.moveTo(0, halfHeight);

    let prevSlice = 0;
    let maxValueInDataSlice = 0;

    for (let i = 0; i < channelLength; i++) {
      const currentSlice = Math.round(i * sliceSize);
      if (currentSlice > prevSlice) {
        const height = Math.round(maxValueInDataSlice * halfHeight * vScale);
        const y = halfHeight + height * (index === 0 ? -1 : 1);
        // console.log(`maxValueInDataSlice: ${maxValueInDataSlice}, height: ${height}`);

        canvasCtx.lineTo(prevSlice, y);

        prevSlice = currentSlice;
        maxValueInDataSlice = 0;
      }

      const value = Math.abs(channel[i]);
      if (value > maxValueInDataSlice) {
        maxValueInDataSlice = value;
      }
    }

    canvasCtx.lineTo(prevSlice, halfHeight);
  }

  function drawSingleChannelLine() {
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

  drawChannelPolyline(0);
  drawChannelPolyline(1);

  canvasCtx.fill();
  canvasCtx.closePath();
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

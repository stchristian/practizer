"use client";

import { AudioWaveform } from "@/AudioWaveform";
import { useAudioControls } from "@/app/useAudioControls";
import React, { useEffect } from "react";
import { useMemo, useRef, useState } from "react";
import Audio from "./Audio";
import MediaButton from "@/app/components/MediaButton";
import PositionLine from "@/app/components/PositionLine";
import FilePicker from "@/app/components/FilePicker";

const context = new window.AudioContext();

const calculateTime = (secs: number) => {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutes}:${returnedSeconds}`;
};

export default function Home() {
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<HTMLSpanElement>(null);
  const positionLineRef = useRef<HTMLDivElement>(null);
  const decodedBuffer = useRef<AudioBuffer | null>(null);

  const { play, pause, state, metadata, audioElement, stop } = useAudioControls({
    whilePlaying(elapsedTime) {
      const positionLineOffset = containerRef.current!.scrollWidth * (elapsedTime / metadata!.duration);
      positionLineRef.current!.style.left = `${positionLineOffset}px`;

      currentTimeRef.current!.textContent = calculateTime(elapsedTime);
    },
  });

  useEffect(() => {
    if (state === "ready") {
      positionLineRef.current!.style.left = `0px`;
    }
  }, [state]);

  async function handleFileUploaded(fileUploaded: File) {
    const arrayBuffer = await fileUploaded.arrayBuffer();
    decodedBuffer.current = await context.decodeAudioData(arrayBuffer);
    setSelectedAudioFile(fileUploaded);
  }

  const fileObjectUrl = useMemo(() => {
    if (selectedAudioFile) {
      return URL.createObjectURL(selectedAudioFile);
    }
    return null;
  }, [selectedAudioFile]);

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 justify-center overflow-hidden">
      {selectedAudioFile && <h1>{selectedAudioFile.name}</h1>}
      {!selectedAudioFile && <FilePicker onFileUpload={handleFileUploaded} />}

      {fileObjectUrl && <Audio src={fileObjectUrl} ref={audioElement} />}
      {state !== "uninitialized" && (
        <p>
          <span ref={currentTimeRef}></span> / {calculateTime(metadata!.duration)}
        </p>
      )}
      <div className="relative bg-slate-200 overflow-scroll max-w-full" ref={containerRef}>
        {decodedBuffer.current && <AudioWaveform audioBuffer={decodedBuffer.current} />}
        <PositionLine ref={positionLineRef} />
      </div>

      <div className="flex gap-4">
        <MediaButton type="play" onClick={play} disabled={state === "playing" || state === "uninitialized"} />
        <MediaButton
          type="pause"
          onClick={pause}
          disabled={state === "ready" || state === "uninitialized" || state === "paused"}
        />
        <MediaButton type="stop" onClick={stop} disabled={state === "ready" || state === "uninitialized"} />
      </div>
    </main>
  );
}

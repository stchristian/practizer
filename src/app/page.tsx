"use client";

import { useAudioControls } from "@/app/components/useAudioControls";
import React from "react";
import { useMemo, useRef, useState } from "react";
import Audio from "./components/Audio";
import MediaButton from "@/app/components/MediaButton";
import FilePicker from "@/app/components/FilePicker";
import { AudioTrack, AudioTrackRef } from "@/app/components/AudioTrack";

const calculateTime = (secs: number) => {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutes}:${returnedSeconds}`;
};

let context: AudioContext | null = null;

export default function Home() {
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const currentTimeRef = useRef<HTMLSpanElement>(null);
  const decodedBuffer = useRef<AudioBuffer | null>(null);
  const audioTrackRef = useRef<AudioTrackRef | null>(null);

  const { play, pause, state, metadata, audioElement, stop, seek } = useAudioControls({
    whilePlaying(elapsedTime) {
      // console.log("whilePlaying()", elapsedTime, metadata?.duration);

      audioTrackRef.current?.animatePositionLine(elapsedTime);
      currentTimeRef.current!.textContent = calculateTime(elapsedTime);
    },
  });

  async function handleFileUploaded(fileUploaded: File) {
    if (!context) context = new window.AudioContext();
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

      {metadata && <AudioTrack buffer={decodedBuffer.current!} onSeek={seek} ref={audioTrackRef} />}
      <div className="flex gap-4">
        <MediaButton type="play" onClick={() => play()} disabled={state === "playing" || state === "uninitialized"} />
        <MediaButton
          type="pause"
          onClick={pause}
          disabled={state === "ready" || state === "uninitialized" || state === "paused"}
        />
        <MediaButton
          type="stop"
          onClick={() => {
            stop();
            audioTrackRef.current?.reset();
          }}
          disabled={state === "ready" || state === "uninitialized"}
        />
      </div>
    </main>
  );
}

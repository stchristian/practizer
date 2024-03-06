"use client";

import { useAudioControls } from "@/app/components/useAudioControls";
import React from "react";
import { useMemo, useRef, useState } from "react";
import Audio from "./components/Audio";
import MediaButton from "@/app/components/MediaButton";
import FilePicker from "@/app/components/FilePicker";
import { AudioTrack, AudioTrackRef } from "@/app/components/AudioTrack";
import { TimeDisplay, TimeDisplayRef } from "@/app/components/TimeDisplay";

let context: AudioContext | null = null;

export default function Home() {
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const currentTimeRef = useRef<TimeDisplayRef>(null);
  const decodedBuffer = useRef<AudioBuffer | null>(null);
  const audioTrackRef = useRef<AudioTrackRef | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);

  const { play, pause, state, metadata, audioElement, stop, seek, audioElementRef } = useAudioControls({
    whilePlaying(elapsedTime) {
      // console.log("whilePlaying()", elapsedTime, metadata?.duration);

      audioTrackRef.current?.animatePositionLine(elapsedTime);

      currentTimeRef.current!.updateCurrentTime(elapsedTime);
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
    <main className="min-h-screen overflow-hidden">
      {!selectedAudioFile && (
        <div className="flex items-center gap-4 justify-center mt-52">
          <FilePicker onFileUpload={handleFileUploaded} />
        </div>
      )}

      {selectedAudioFile && (
        <>
          {fileObjectUrl && <Audio src={fileObjectUrl} ref={audioElement} />}
          <label>
            Playback rate
            <input
              type="range"
              value={playbackRate}
              min="0.25"
              max="1"
              step="0.01"
              onChange={(e) => {
                setPlaybackRate(parseFloat(e.target.value));
                audioElementRef.current!.playbackRate = parseFloat(e.target.value);
              }}
            ></input>
          </label>
          <div className="flex flex-row justify-between px-2 py-4 mt-52">
            <h1 className="font-bold text-lg">{selectedAudioFile.name}</h1>
            {state !== "uninitialized" && <TimeDisplay duration={metadata!.duration} ref={currentTimeRef} />}
          </div>
          {metadata && (
            <AudioTrack
              buffer={decodedBuffer.current!}
              onSeek={(to) => {
                seek(to);
                currentTimeRef.current!.updateCurrentTime(to);
              }}
              ref={audioTrackRef}
            />
          )}
          <div className="flex gap-4 px-2 py-4">
            <MediaButton
              type="play"
              onClick={() => play()}
              disabled={state === "playing" || state === "uninitialized"}
            />
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
        </>
      )}
    </main>
  );
}

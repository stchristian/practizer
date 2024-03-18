"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppStateContext } from "@/app/components/AppState/AppState.context";
import Audio from "@/app/components/Audio";
import { TimeDisplay, TimeDisplayRef } from "@/app/components/TimeDisplay";
import { AudioTrack, AudioTrackRef } from "@/app/components/AudioTrack";
import { useAudioControls } from "@/app/components/useAudioControls";
import MediaButton from "@/app/components/MediaButton";
import TempoSlider from "@/app/components/TempoSlider/TempoSlider";
import { redirect } from "next/navigation";

export default function Player() {
  const { appState } = useAppStateContext();
  if (!appState.selectedAudioFile) {
    // Redirect should be used on server side but since client components are also
    // prerendered (SSR), this works. Client side navigation should never arrive in this branch
    redirect("/");
  }
  const { selectedAudioFile } = appState;
  const currentTimeRef = useRef<TimeDisplayRef>(null);
  const [decodedBuffer, setDecodedBuffer] = useState<AudioBuffer | null>(null);
  const audioTrackRef = useRef<AudioTrackRef | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);

  const { play, pause, state, metadata, audioElement, stop, seek, audioElementRef } = useAudioControls({
    whilePlaying(elapsedTime) {
      audioTrackRef.current?.animatePositionLine(elapsedTime);
      currentTimeRef.current!.updateCurrentTime(elapsedTime);
    },
  });

  useEffect(() => {
    (async () => {
      const arrayBuffer = await selectedAudioFile.arrayBuffer();
      setDecodedBuffer(await new window.AudioContext().decodeAudioData(arrayBuffer));
    })();
  }, [selectedAudioFile]);

  const fileObjectUrl = useMemo(() => {
    return URL.createObjectURL(selectedAudioFile);
  }, [selectedAudioFile]);

  return (
    <>
      {fileObjectUrl && <Audio src={fileObjectUrl} ref={audioElement} />}
      <div className="flex flex-row justify-between p-4 mt-52">
        <h1 className="font-bold text-lg">{selectedAudioFile.name}</h1>
        <div className="flex flex-row items-center gap-4">
          {state !== "uninitialized" && <TimeDisplay duration={metadata!.duration} ref={currentTimeRef} />}
          <div>
            <button
              className="px-4 py-2 border border-slate-500"
              onClick={() => {
                setZoomLevel((zoomLevel) => zoomLevel * 0.9);
              }}
            >
              -
            </button>
            <button
              className="px-4 py-2 border border-slate-500"
              onClick={() => {
                setZoomLevel((zoomLevel) => zoomLevel * 1.1);
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
      {metadata && decodedBuffer && (
        <AudioTrack
          buffer={decodedBuffer}
          zoomLevel={zoomLevel}
          onSeek={(to) => {
            seek(to);
            currentTimeRef.current!.updateCurrentTime(to);
          }}
          ref={audioTrackRef}
        />
      )}
      <div className="flex gap-4 p-4">
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
        <TempoSlider
          value={playbackRate}
          onChange={(e) => {
            setPlaybackRate(parseFloat(e.target.value));
            audioElementRef.current!.playbackRate = parseFloat(e.target.value);
          }}
        />
      </div>
    </>
  );
}

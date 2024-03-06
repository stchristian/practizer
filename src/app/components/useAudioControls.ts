"use client";
import { useCallback, useReducer, useRef } from "react";

type AudioState = "uninitialized" | "ready" | "playing" | "paused" | "finished";
type Metadata = {
  duration: number;
};

type LoadAudio = { type: "LOAD_AUDIO_FILE"; payload: Metadata };
type Play = { type: "PLAY" };
type Pause = {
  type: "PAUSE";
  payload: {
    pausedAt: number;
  };
};
type Stop = {
  type: "STOP";
};
type Finished = {
  type: "FINISHED";
};

type Actions = LoadAudio | Play | Pause | Stop | Finished;

type AudioControlState = {
  state: AudioState;
  pausedAt?: number; // This will only be updated when audio is paused
  metadata?: Metadata;
};

const initialState: AudioControlState = {
  state: "uninitialized",
};

function reducer(prevState: AudioControlState, action: Actions): AudioControlState {
  switch (action.type) {
    case "LOAD_AUDIO_FILE":
      return { state: "ready", metadata: action.payload };
    case "PLAY":
      return { ...prevState, state: "playing" };
    case "PAUSE":
      return { ...prevState, state: "paused", pausedAt: action.payload.pausedAt };
    case "STOP":
      return { ...prevState, state: "ready", pausedAt: 0 };
    case "FINISHED":
      return { ...prevState, state: "finished", pausedAt: 0 };
    default:
      return prevState;
  }
}

export function useAudioControls(options: { whilePlaying?: (elapsedTime: number) => void }) {
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [audioState, dispatch] = useReducer(reducer, initialState);

  function playAnimationIfAny() {
    if (options.whilePlaying) {
      options.whilePlaying(audioElementRef.current!.currentTime);
      animationRef.current = requestAnimationFrame(playAnimationIfAny);
    }
  }

  function getAudioElement() {
    if (audioState.state === "uninitialized") throw new Error("Audio is not initialized");
    return audioElementRef.current!;
  }

  function seek(to: number) {
    getAudioElement().currentTime = to;
  }

  function play(from?: number) {
    if (typeof from !== "undefined") {
      // TODO check value
      getAudioElement().currentTime = from;
    }
    getAudioElement().play();
    playAnimationIfAny();
    dispatch({
      type: "PLAY",
    });
  }

  function pause() {
    getAudioElement().pause();
    cancelAnimationFrame(animationRef.current!);
    dispatch({
      type: "PAUSE",
      payload: {
        pausedAt: getAudioElement().currentTime,
      },
    });
  }

  function stop() {
    getAudioElement().load();
    dispatch({
      type: "STOP",
    });
    cancelAnimationFrame(animationRef.current!);
  }

  const loadAudioElement = useCallback(
    (element: HTMLAudioElement | null) => {
      if (!element) return;
      element.addEventListener("loadedmetadata", () => {
        dispatch({
          type: "LOAD_AUDIO_FILE",
          payload: {
            duration: element.duration,
          },
        });
      });
      element.addEventListener("ended", () => {
        console.log("ENDED");
        cancelAnimationFrame(animationRef.current!);
        dispatch({
          type: "FINISHED",
        });
      });
      audioElementRef.current = element;
    },
    [dispatch]
  );

  return {
    play,
    pause,
    stop,
    seek,
    audioElement: loadAudioElement,
    audioElementRef,
    ...audioState,
  };
}

"use client";
import { requireRef } from "@/app/utils";
import { useCallback, useEffect, useReducer, useRef } from "react";

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

  const playAnimationIfAny = useCallback(
    function () {
      if (options.whilePlaying) {
        options.whilePlaying(requireRef(audioElementRef).currentTime);
        animationRef.current = requestAnimationFrame(playAnimationIfAny);
      }
    },
    [options]
  );

  const play = useCallback(
    function (from?: number) {
      if (typeof from !== "undefined") {
        // TODO check value
        requireRef(audioElementRef).currentTime = from;
      }

      requireRef(audioElementRef).play();
      playAnimationIfAny();
      dispatch({
        type: "PLAY",
      });
    },
    [playAnimationIfAny]
  );

  const pause = useCallback(function () {
    requireRef(audioElementRef).pause();
    cancelAnimationFrame(animationRef.current!);
    dispatch({
      type: "PAUSE",
      payload: {
        pausedAt: requireRef(audioElementRef).currentTime,
      },
    });
  }, []);

  const stop = useCallback(function () {
    requireRef(audioElementRef).load();
    dispatch({
      type: "STOP",
    });
    cancelAnimationFrame(animationRef.current!);
  }, []);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      switch (e.key) {
        case " ":
          if (audioState.state === "playing") {
            pause();
          } else {
            play();
          }
          break;
        case "r":
          stop();
        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [pause, play, audioState.state, stop]);

  function seek(to: number) {
    requireRef(audioElementRef).currentTime = to;
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
      element.addEventListener("durationchange", () => {
        console.log("DURATION CHANGE");
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

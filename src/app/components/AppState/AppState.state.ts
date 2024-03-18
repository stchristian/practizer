type AudioState = "uninitialized" | "ready" | "playing" | "paused" | "finished";

type Metadata = {
  duration: number;
};

type PlayerState = {
  state: AudioState;
  pausedAt?: number; // This will only be updated when audio is paused
  metadata?: Metadata;
};

export type AppState = {
  player?: PlayerState;
  selectedAudioFile?: File;
};

type PayloadAction<P = void, T extends string = string> = { payload: P; type: T };

function createAction<T extends string>(type: T): PayloadAction<undefined, T>;
function createAction<T extends string, P>(type: T, payload: P): PayloadAction<P, T>;
function createAction<T extends string, P>(type: T, payload?: P) {
  return payload === undefined ? { type } : { type, payload };
}

enum ActionTypes {
  FILE_SELECTED = "FILE_SELECTED",
  LOAD_AUDIO_FILE = "LOAD_AUDIO_FILE",
  PLAY = "PLAY",
  PAUSE = "PAUSE",
  STOP = "STOP",
  FINISHED = "FINISHED",
}

export const actions = {
  fileSelected: (file: File) => createAction(ActionTypes.FILE_SELECTED, file),
  loadAudioFile: (metadata: Metadata) => createAction(ActionTypes.LOAD_AUDIO_FILE, metadata),
  play: () => createAction(ActionTypes.PLAY),
  pause: () => createAction(ActionTypes.PAUSE),
  stop: () => createAction(ActionTypes.STOP),
  finished: () => createAction(ActionTypes.FINISHED),
};

type GetAllActions<T> = T extends { [key: string]: (...args: any) => infer U } ? U : never;

type Actions = GetAllActions<typeof actions>;

export const initialState: AppState = {};

export function reducer(prevState: AppState, action: Actions): AppState {
  switch (action.type) {
    case ActionTypes.LOAD_AUDIO_FILE:
      return { ...prevState, player: { ...prevState.player, state: "ready", metadata: action.payload } };
    case ActionTypes.PLAY:
      return { ...prevState, player: { ...prevState.player, state: "playing" } };
    case ActionTypes.PAUSE:
      return { ...prevState, player: { ...prevState.player, state: "paused", pausedAt: action.payload } };
    case ActionTypes.STOP:
      return { ...prevState, player: { ...prevState.player, state: "ready", pausedAt: 0 } };
    case ActionTypes.FINISHED:
      return { ...prevState, player: { ...prevState.player, state: "finished", pausedAt: 0 } };
    case ActionTypes.FILE_SELECTED:
      return { ...prevState, selectedAudioFile: action.payload };
    default:
      return prevState;
  }
}

"use client";
import { initialState, reducer, actions, AppState } from "@/app/components/AppState/AppState.state";
import React, { createContext, useMemo, useReducer } from "react";

type ActionMap = typeof actions;

type WithoutReturnValue<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;

type BindedActions = {
  [K in keyof ActionMap]: WithoutReturnValue<ActionMap[K]>;
};

type AppStateContextValueType = BindedActions & {
  appState: AppState;
};

export const AppStateContext = createContext<AppStateContextValueType | null>(null);

export const useAppStateContext = () => {
  const playerContext = React.useContext(AppStateContext);
  if (!playerContext) {
    throw new Error("useAppStateContext must be used within a AppStateProvider");
  }
  return playerContext;
};

const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [appState, dispatch] = useReducer(reducer, initialState);

  const bindedActions = useMemo(() => {
    return Object.keys(actions).reduce((acc, key) => {
      //@ts-ignore
      acc[key] = (...args: any[]) => dispatch(actions[key](...args));
      return acc;
    }, {} as any) as BindedActions;
  }, [dispatch]);

  const value = useMemo(
    () => ({
      appState,
      ...bindedActions,
    }),
    [bindedActions, appState]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export default AppStateProvider;

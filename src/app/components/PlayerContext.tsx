"use client";
import React, { createContext, useState } from "react";

type PlayerContextType = {
  selectedAudioFile: File | null;
  setSelectedAudioFile: (file: File | null) => void;
};

export const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayerContext = () => {
  const playerContext = React.useContext(PlayerContext);
  if (!playerContext) {
    throw new Error("usePlayerContext must be used within a PlayerContextProvider");
  }
  return playerContext;
};

const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);

  return (
    <PlayerContext.Provider
      value={{
        selectedAudioFile,
        setSelectedAudioFile,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;

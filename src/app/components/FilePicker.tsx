"use client";

import { useRouter } from "next/navigation";
import { usePlayerContext } from "@/app/components/PlayerContext";
import React from "react";

function FilePicker() {
  const router = useRouter();
  const { setSelectedAudioFile } = usePlayerContext();

  return (
    <label className="bg-gray-300 p-4">
      Choose audio file
      <input
        type="file"
        hidden
        accept=".mp3,audio/*"
        onChange={(e) => {
          e.target.files?.[0] && setSelectedAudioFile(e.target.files[0]);
          router.push("/player");
        }}
      />
    </label>
  );
}

export default FilePicker;

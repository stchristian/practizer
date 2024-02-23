import React from "react";

function FilePicker({ onFileUpload }: { onFileUpload: (file: File) => void }) {
  return (
    <label className="bg-gray-300 p-4">
      Choose audio file
      <input
        type="file"
        hidden
        accept=".mp3,audio/*"
        onChange={(e) => {
          e.target.files?.[0] && onFileUpload(e.target.files[0]);
        }}
      />
    </label>
  );
}

export default FilePicker;

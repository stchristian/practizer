"use client";

import React from "react";
import Pause from "@/app/icons/Pause";
import Play from "@/app/icons/Play";
import Stop from "@/app/icons/Stop";

type MediaButtonProps = {
  type: "play" | "pause" | "stop";
} & Pick<React.ComponentPropsWithoutRef<"button">, "onClick" | "className" | "disabled">;

const icons = {
  play: <Play />,
  pause: <Pause />,
  stop: <Stop />,
};

function MediaButton({ type, ...buttonProps }: MediaButtonProps) {
  return (
    <button {...buttonProps} className={`border disabled:opacity-60 ${buttonProps.className ?? ""}`}>
      {icons[type]}
    </button>
  );
}

export default MediaButton;

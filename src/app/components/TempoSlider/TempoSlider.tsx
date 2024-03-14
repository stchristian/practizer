import { robotoMono } from "@/app/fonts";
import React from "react";

function TempoSlider({ value, onChange }: { value: number; onChange: React.ChangeEventHandler<HTMLInputElement> }) {
  return (
    <label className={`p-4 flex flex-row ${robotoMono.className}`}>
      <div className="flex flex-col">
        <input
          name="tempo"
          value={value}
          type="range"
          className="tempo-slider w-96"
          min={0.1}
          max={1}
          onChange={onChange}
          step={0.01}
        ></input>
        <div className="flex flex-row w-96 justify-between -mt-4 relative -z-10">
          <span className="flex w-px items-center flex-col">
            <span className="w-px bg-slate-400 h-4"></span>
            <span className="text-xs">0.1</span>
          </span>
          <span className="flex w-px items-center flex-col">
            <span className="w-px bg-slate-400 h-4"></span>
            <span className="text-xs">1.0</span>
          </span>
        </div>
      </div>
      <span className="text-base ml-6">{value.toPrecision(2)}</span>
    </label>
  );
}

export default TempoSlider;

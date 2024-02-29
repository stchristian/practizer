"use client";
import React from "react";

export type PositionLineProps = Pick<React.ComponentPropsWithRef<"div">, "onClick">;

const PositionLine = React.forwardRef<HTMLDivElement, PositionLineProps>((props, ref) => {
  return (
    <div
      className="absolute w-px border border-black top-0 bottom-0 after:content-[''] after:p-4 after:block after:h-full after:-ml-4 after:cursor-pointer"
      ref={ref}
    ></div>
  );
});

PositionLine.displayName = "PositionLine";

export default PositionLine;

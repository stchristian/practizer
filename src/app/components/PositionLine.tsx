import React from "react";

export type PositionLineProps = {};

const PositionLine = React.forwardRef<HTMLDivElement, PositionLineProps>((props, ref) => {
  return <div className="absolute w-px border border-black top-0 bottom-0" ref={ref}></div>;
});

PositionLine.displayName = "PositionLine";

export default PositionLine;

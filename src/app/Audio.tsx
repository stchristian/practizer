import React from "react";

export interface AudioProps extends React.ComponentPropsWithRef<"audio"> {}

const Audio = React.memo(
  React.forwardRef<HTMLAudioElement, AudioProps>((props, ref) => {
    return <audio {...props} ref={ref} />;
  })
);

Audio.displayName = "Audio";

export default Audio;

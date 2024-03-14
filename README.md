# Practizer

[https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/](https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/)

https://css-tricks.com/lets-create-a-custom-audio-player/
https://stackoverflow.com/questions/31644060/how-can-i-get-an-audiobuffersourcenodes-current-time
https://github.com/WebAudio/web-audio-api/issues/2397
https://web.dev/articles/audio-scheduling

Things to do next:

- ~~Tempo slider;~~ -> make a design
- Seek in audio ✅
- Choose a monospace font for the time ✅
- Fix position line and timer goes beyond the end of the track. **UPDATE** this is happening because the duration is updated when the player reaches the end of the track. It's possible that the metadata of this audio file is corrupted because trying with other Mp3 files it works perfectly fine. ✅
- Beat detection based on [this article](http://joesul.li/van/beat-detection-using-web-audio/)
- Zoom behaviour with buttons. Note: now if you zoom out on the track so that the waveform becomes smaller than the screen width the position line will outrun the waveform. Solution A: restrict zooming out so that waveform has to always fill the screen
- Fix page reload when /player, now the app crashes ✅
- Update home page
- Position line
  1. Click on line turns on the dragging mode and stops music if it was running
  2. Drag the line along the track while holding the mouse
  3. Drop the marker and resume from this position if it was running previously.
- Create _React Context_ instead `useAudioControls()` hook. It could create it's own audio element in the document. This could be incorporated into `PlayerContext`

Position line: PL

When the music is playing and PL is at the right of the viewport -> scroll is needed.
When you seek with the PL you can also trigger the track to scroll both forwards and backwards. Scroll stops if scroll limit is reached.
PL default position mode: relative to track.
PL when dragging: absolute to viewport.

When PL is released, relative position is updated and it will be scrollLeft + clientX.

Learned

- `Element.getBoundingClientReact()`: info about the size of an element relative to viewport. x,y,left,top,right,bottom,width,height
- `useImperativeHandle()`: customize the handle exposed as ref. More [here](https://react.dev/reference/react/useImperativeHandle)
- `Element.scrollWidth/scrollHeight`: width/height of element's content including content that is not visible due to overflow.
- `Element.scrollLeft/scrollTop`: the amount of scroll counting from left/top
- Canvas has 2 sizes: drawing buffer size and displayed size in CSS pixels. More [here](https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html)
- Waveformer library to visualize [waveforms](https://wavesurfer.xyz/). _renderLineWaveform_ in _renderer.ts_ renders the two channels. [Code snippet of the rendering process with comments](https://gist.github.com/stchristian/d324ebc86c121f79db9eb319e60dbbfc)
- Web Audio framework to create interactive music in the browser: [Tone.js](https://tonejs.github.io/)

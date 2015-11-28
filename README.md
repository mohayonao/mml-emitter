# mml-emitter
[![Build Status](http://img.shields.io/travis/mohayonao/mml-emitter.svg?style=flat-square)](https://travis-ci.org/mohayonao/mml-emitter)
[![NPM Version](http://img.shields.io/npm/v/mml-emitter.svg?style=flat-square)](https://www.npmjs.org/package/mml-emitter)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://mohayonao.mit-license.org/)

> MML(Music Macro Language) event sequencer for Web Audio API

## Installation

```
$ npm install mml-iterator
```

downloads:

- [mml-emitter.js](./build/mml-emitter.js)
- [mml-emitter.min.js](./build/mml-emitter.min.js)

## API
### MMLEmitter
- `constructor(source: string, config = {})`

#### Instance attributes
- `tracks: EventEmitter[]`
- `scheduler: WebAudioScheduler`
  - instance of [WebAudioScheduler](https://github.com/mohayonao/web-audio-scheduler)

#### Instance methods
_Also implements methods from the interface [EventEmitter](https://nodejs.org/api/events.html)._

- `start(): self`
- `stop(): self`

#### Events
- `note`
  - `type: "note"`
  - `playbackTime: number`
  - `trackNumber: number`
  - `noteNumber: number`
  - `frequency: number`
  - `duration: number`
  - `gateTime: number`
  - `volume: number`
- `end`
  - `type: "end"`
  - `playbackTime: number`

## Example

```js
import MMLEmitter from "mml-emitter";

let config = { context: audioContext };
let mmlEmitter = new MMLEmitter(mml, config);

mmlEmitter.on("note", (e) => {
  console.log("NOTE: " + JSON.stringify(e));
});
mmlEmitter.on("end", (e) => {
  console.log("END : " + JSON.stringify(e));
  mmlEmitter.stop();
});

mmlEmitter.start();
```

## See Also
- [MML Syntax & Configuration](https://github.com/mohayonao/mml-iterator)
- [ADSREnvelope](https://github.com/mohayonao/adsr-envelope)

## License

MIT

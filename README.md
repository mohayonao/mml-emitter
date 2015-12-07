# mml-emitter
[![Build Status](http://img.shields.io/travis/mohayonao/mml-emitter.svg?style=flat-square)](https://travis-ci.org/mohayonao/mml-emitter)
[![NPM Version](http://img.shields.io/npm/v/mml-emitter.svg?style=flat-square)](https://www.npmjs.org/package/mml-emitter)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://mohayonao.mit-license.org/)

> MML(Music Macro Language) event emitter for Web Audio API

## Installation

```
$ npm install mml-emitter
```

downloads:

- [mml-emitter.js](https://raw.githubusercontent.com/mohayonao/mml-emitter/master/build/mml-emitter.js)
- [mml-emitter.min.js](https://raw.githubusercontent.com/mohayonao/mml-emitter/master/build/mml-emitter.min.js)

## API
### MMLEmitter
- `constructor(source: string, config = {})`

#### Instance methods
_Also implements methods from the interface [EventEmitter](https://nodejs.org/api/events.html)._

- `start([ t0: number ]): void`
- `stop([ t0: number ]): void`

#### Events
- `note`
  - `type: "note"`
  - `playbackTime: number`
  - `trackNumber: number`
  - `noteNumber: number`
  - `duration: number`
  - `velocity: number`
  - `quantize: number`
- `end`
  - `type: "end"`
  - `playbackTime: number`
  - `trackNumber: number`
- `end:all`
  - `type: "end:all"`
  - `playbackTime: number`

## Example

```js
import MMLEmitter from "mml-emitter";

let mml = "t200 o6 l8 e g > e c d g";
let config = { context: audioContext };
let mmlEmitter = new MMLEmitter(mml, config);

mmlEmitter.on("note", (e) => {
  console.log("NOTE: " + JSON.stringify(e));
});
mmlEmitter.on("end:all", (e) => {
  console.log("END : " + JSON.stringify(e));
  mmlEmitter.stop();
});

mmlEmitter.start();
```

## Demo
- http://mohayonao.github.io/mml-emitter/

## See Also
- MML Syntax
  - [MMLIterator](https://github.com/mohayonao/mml-iterator) / MML(Music Macro Language) Iterator
- Configuration
  - [WebAudioScheduler](https://github.com/mohayonao/web-audio-scheduler) / Event Scheduler for Web Audio API
- NoteNumber to Frequency
  - `mtof = m => 440 * Math.pow(2, (m - 69) / 12)`

## License

MIT

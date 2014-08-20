# MMLEmitter
[![Build Status](http://img.shields.io/travis/mohayonao/MMLEmitter.svg?style=flat)](https://travis-ci.org/mohayonao/MMLEmitter)
[![Coverage Status](http://img.shields.io/coveralls/mohayonao/MMLEmitter.svg?style=flat)](https://coveralls.io/r/mohayonao/MMLEmitter?branch=master)
[![Dependency Status](http://img.shields.io/david/mohayonao/MMLEmitter.svg?style=flat)](https://david-dm.org/mohayonao/MMLEmitter)
[![devDependency Status](http://img.shields.io/david/dev/mohayonao/MMLEmitter.svg?style=flat)](https://david-dm.org/mohayonao/MMLEmitter)

> **MMLEmitter** is a MML(Music Macro Language) event sequencer based on Web Audio API.

## Online Playground

  - http://mohayonao.github.io/MMLEmitter/

## Install

##### browser

  - [MMLEmitter.js](http://mohayonao.github.io/MMLEmitter/build/MMLEmitter.js)
  - [MMLEmitter.min.js](http://mohayonao.github.io/MMLEmitter/build/MMLEmitter.min.js)

```html
<script src="/path/to/MMLEmitter.js"></script>
```

## Usage

```javascript
function midicps(midi) {
  return 440 * Math.pow(2, (midi - 69) * 1 / 12);
}

function noteEventHandler(e) {
  var osc  = audioContext.createOscillator();
  var amp  = audioContext.createGain();
  var when = e.when;

  osc.frequency.value = midicps(e.midi);
  osc.type = "triangle";
  amp.gain.setValueAtTime(0.25, when);
  amp.gain.linearRampToValueAtTime(0.0, when + e.duration);

  osc.start(when);
  osc.connect(amp);
  amp.connect(audioContext.destination);

  e.noteOff(function() {
    amp.disconnect();
  }, 0.1); // called after 'e.duration' + 0.1sec
}

var mml = new MMLEmitter(
  audioContext, "t100 l8 cege [>eg<c]2"
);

mml.tracks[0].on("note", noteEventHandler);

mml.start();
```

## Features

#### Multi Tracks

`;` splits tracks.

```javascript
var mml = new MMLEmitter(
  audioContext, [
    "l8 erer edef grgg e2 d4de ffed crcc c2",
    "l2 q8 c>bab- fg+ a8e-8f8g+8 a2"
  ].join(";")
);

mml.tracks[0].on("note", noteEventHandler0);
mml.tracks[1].on("note", noteEventHandler1);

mml.start();
```

#### Directives

```javascript
var mml = new MMLEmitter(
  audioContext, "t($tempo) l(len) @(doSomething()) cdef gab<c >"
);

// if starts with '$', it is a shared variable for all tracks
mml.tempo = 120;

// else, it is a variable for the specified track.
mml.tracks[0].len = _.sample([ 2, 4, 8 ,16 ]);

mml.tracks[0].doSomething = function() {
  console.log("bang!!");
};
```

## Syntax

###### Pitch

  - [**a**-**g**][**-+**]?_[number]_**.***
    - note on (1-1920, default: l)
  - **[** ([**a**-**g**][**-+**]?|[**<>**])+ **]**_[number]_**.***
    - chord (1-1920, default: l)
  - **r**_[number]_**.***
    - rest (1-1920, default: l)
  - **o**_[number]_
    - octave (0-9, default: 5)
  - **<**_[number]_
    - octave up (1-9, default: 1)
  - **>**_[number]_
    - octave down (1-9, default: 1)

###### Duration

  - **l**_[number]_**.***
    - length (1-1920, default: 4)
  - **^**_[number]_**.***
    - tie (1-1920, default: l)
  - **q**_[number]_
    - quantize (0-8, default: 6)

###### Control

  - **t**_[number]_
    - tempo (1-511, default: 120)
  - **v**_[number]_
    - velocity (0-16, default: 12)
  - **$**
    - infinite loop
  - **/:** ... **|** ... **:/**_[number]_
    - loop  (1-999, default: 2)
    - commands after `|` are skipped in last loop
  - **;**
    - track separator

###### Programming

  - **@(** ... **)**
    - execute code
  - **//** ...
    - single line comment
  - **/*** ... **\*/**
    - multi line comment

## API

### MMLEmitter

###### Constructor

  - `new MMLEmitter(audioContext:AudioContext, mml:string) : MMLEmitter`

###### Methods

  - `on(eventName:string, callback:function) : MMLEmitter`
  - `once(eventName:string, callback:function) : MMLEmitter`
  - `off(eventName:string, callback:function) : MMLEmitter`
  - `start() : MMLEmitter`
  - `stop() : MMLEmitter`

###### Properties

  - `audioContext : AudioContext`
  - `tracks : [ MMLTrack ]`

###### Events

  - `"end" : (event:object)->`
    - `when:number`

### MMLTrack

###### Methods

  - `on(eventName:string, callback:function) : MMLTrack`
  - `once(eventName:string, callback:function) : MMLTrack`
  - `off(eventName:string, callback:function) : MMLTrack`

###### Events

  - `"note" : (event:object)->`
    - `when:number`
    - `midi:number`
    - `duration:number`
    - `noteOff:function`
    - `chordIndex:number`
    - `velocity:number`
  - `"end" : (event:object)->`
    - `when:number`

## Contribution

  1. Fork (https://github.com/mohayonao/MMLEmitter/fork)
  1. Create a feature branch (`git checkout -b my-new-feature`)
  1. Commit your changes (`git commit -am 'add some feature'`)
  1. Run test suite with the `gulp travis` command and confirm that it passes
  1. Push to the branch (`git push origin my-new-feature`)
  1. Create new Pull Request

## License

MMLEmitter is available under the The MIT License.

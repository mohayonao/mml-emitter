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
var mml = new MMLEmitter(
  audioContext, "t100 l8 @(wave='sawtooth') cege [>eg<c]2"
);

mml.tracks[0].on("note", noteEventHandler);

mml.start();

function noteEventHandler(e) {
  var osc  = audioContext.createOscillator();
  var amp  = audioContext.createGain();
  var when = e.when;

  osc.frequency.value = midicps(e.midi);
  osc.type = this.wave || "triangle";
  amp.gain.setValueAtTime(0.25 * (e.volume / 16), when);
  amp.gain.linearRampToValueAtTime(0.0, when + e.duration);

  osc.start(when);
  osc.connect(amp);
  amp.connect(audioContext.destination);

  e.noteOff(function() {
    amp.disconnect();
  }, 0.1); // called after 'duration' + 0.1sec
}
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

`( expr )` is evaluated at runtime

```javascript
var mml = new MMLEmitter(
  audioContext, "t($tempo) l(len) @(log('bang!!')) cdef gab<c >"
);

// if starts with '$', it is a shared variable for all tracks
mml.tempo = 120;

// same above
mml.tracks[0].$tempo = 120;

// else, it is a variable for the specified track.
mml.tracks[0].len = _.sample([ 2, 4, 8 ,16 ]);

mml.tracks[0].log = function(msg) {
  console.log(msg);
};
```

## MML Syntax

###### Pitch

  - [**a**-**g**][**-+**]?_[number]_**.***
    - note on (1-64, default: l)
  - **[** ([**a**-**g**][**-+**]?|[**<>**])+ **]**_[number]_**.***
    - chord (1-64, default: l)
  - **r**_[number]_**.***
    - rest (1-64, default: l)
  - **o**_[number]_
    - octave (0-9, default: 5)
  - **<**_[number]_
    - octave up (1-9, default: 1)
  - **>**_[number]_
    - octave down (1-9, default: 1)

###### Duration

  - **l**_[number]_**.***
    - length (1-64, default: 4)
  - **^**_[number]_**.***
    - tie (1-64, default: l)
  - **q**_[number]_
    - quantize (0-8, default: 6)

###### Control

  - **t**_[number]_
    - tempo (30-240, default: 120)
  - **v**_[number]_
    - volume (0-16, default: 12)
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

  - `new MMLEmitter(audioContext:AudioContext, mml:string, config:object) : MMLEmitter`

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
    - `type:string` event name, "end"
    - `when:number` current time

### MMLTrack

###### Methods

  - `on(eventName:string, callback:function) : MMLTrack`
  - `once(eventName:string, callback:function) : MMLTrack`
  - `off(eventName:string, callback:function) : MMLTrack`

###### Events

  - `"note" : (event:object)->`
    - `type:string` event name, "note"
    - `index:number` index of note events
    - `when:number` what time (in seconds) the sound should start playing
    - `nextWhen:number` time of next note event
    - `midi:number` calculated midi tone number
    - `frequency:number` calculated frequency
    - `duration:number` calculated duration
    - `isChord:boolean` true if it is a part of chord
    - `chordIndex:number` index of chord
    - `noteNum:number` information of note number
    - `accidental:number` information of accidental
    - `tempo:number` current value of `t` command
    - `volume:number` current value of `v` command
    - `octave:number` current value of `o` command
    - `length:number` current value of `l` command
    - `quantize:number` current value of `q` command
    - `noteOff:function`
  - `"end" : (event:object)->`
    - `type:string` event name, "end"
    - `when:number` current time

### Custom Cnofiguration

In MMLEmitter constructor, you can give third argument to adapt custom configuration.

```json
{
  "defaultTempo": 120,
  "minTempo": 30,
  "maxTempo": 240,
  "defaultOctave": 5,
  "minOctave": 0,
  "maxOctave": 9,
  "defaultLength": 4,
  "minLength": 1,
  "maxLength": 64,
  "defaultQuantize": 6,
  "minQuantize": 0,
  "maxQuantize": 8,
  "defaultVolume": 12,
  "minVolume": 0,
  "maxVolume": 16,
  "octaveShiftDirection": 1,
  "A4Frequency": 440.0,
  "A4Index": 69
}
```

## Contribution

  1. Fork (https://github.com/mohayonao/MMLEmitter/fork)
  1. Create a feature branch (`git checkout -b my-new-feature`)
  1. Commit your changes (`git commit -am 'add some feature'`)
  1. Run test suite with the `gulp travis` command and confirm that it passes
  1. Push to the branch (`git push origin my-new-feature`)
  1. Create new Pull Request

## License

MMLEmitter is available under the The MIT License.

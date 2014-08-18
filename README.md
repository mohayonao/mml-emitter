# wamml
[![Build Status](http://img.shields.io/travis/mohayonao/wamml.svg?style=flat)](https://travis-ci.org/mohayonao/wamml)
[![Coverage Status](http://img.shields.io/coveralls/mohayonao/wamml.svg?style=flat)](https://coveralls.io/r/mohayonao/wamml?branch=master)
[![Dependency Status](http://img.shields.io/david/mohayonao/wamml.svg?style=flat)](https://david-dm.org/mohayonao/wamml)
[![devDependency Status](http://img.shields.io/david/dev/mohayonao/wamml.svg?style=flat)](https://david-dm.org/mohayonao/wamml)

> **Wamml** (wáml, ワムル) is a MML sequencer for Web Audio API.

## Online Playground

  - http://mohayonao.github.io/wamml/

## Install

##### browser

  - [wamml.js](http://mohayonao.github.io/wamml/build/wamml.js)
  - [wamml.min.js](http://mohayonao.github.io/wamml/build/wamml.min.js)

```html
<script src="/path/to/wamml.js"></script>
```

## Usage

```javascript
function midicps(midi) {
  return 440 * Math.pow(2, (midi - 69) * 1 / 12);
}

function toneGenerator(when, midi, duration, noteOff) {
  var osc = audioContext.createOscillator();
  var amp = audioContext.createGain();

  osc.frequency.value = midicps(midi);
  osc.type = "triangle";
  amp.gain.setValueAtTime(0.25, when);
  amp.gain.linearRampToValueAtTime(0.0, when + duration);

  osc.start(when);
  osc.connect(amp);
  amp.connect(audioContext.destination);

  noteOff(function() {
    amp.disconnect();
  }, 0.1); // called after 'duration' + 0.1sec
}

var sequencer = new wamml.Sequencer(
  audioContext, "t100 l8 cege (>eg<c)2"
);

sequencer.tracks[0].on("note", toneGenerator);

sequencer.start();
```

## Features

#### Multi Tracks

`;` splits tracks.

```javascript
var sequencer = new wamml.Sequencer(
  audioContext, [
    "l8 erer edef grgg e2 d4de ffed crcc c2",
    "l2 q8 c>bab- fg+ a8e-8f8g+8 a2"
  ].join(";")
);

sequencer.tracks[0].on("note", noteOnFunction0);
sequencer.tracks[1].on("note", noteOnFunction1);

sequencer.start();
```

#### Directives

:zap: this feature has not implemented yet.

```javascript
var sequencer = new wamml.Sequencer(
  audioContext, "t{{ $tempo }} l{{ len }} cdef gab<c >"
);

// if starts with '$', it is a shared variable for all tracks
sequencer.tracks[0].tempo = 120;

// else, it is a variable for the specified track.
sequencer.tracks[0].len = _.sample([ 2, 4, 8 ,16 ]);
```

## Syntax

###### Pitch

  - [**a**-**g**][**-+**]?_[number]_**.***
    - note on (1-1920, default: l)
  - **(** ([**a**-**g**][**-+**]?|[**<>**])+ **)**_[number]_**.***
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
  - **$**
    - infinite loop
  - **[** ... **|** ... **]**_[number]_
    - loop  (1-999, default: 2)
    - commands after `|` are skipped in last loop
  - **;**
    - track separator

###### Programming

  - **//** ...
    - single line comment
  - **/*** ... **\*/**
    - multi line comment

## API

### Sequencer

###### Constructor

  - `new wamml.Sequencer(audioContext:AudioContext, mml:string) : Sequencer`

###### Methods

  - `on(eventName:string, callback:function) : Sequencer`
  - `once(eventName:string, callback:function) : Sequencer`
  - `off(eventName:string, callback:function) : Sequencer`
  - `start() : Sequencer`
  - `stop() : Sequencer`

###### Properties

  - `audioContext : AudioContext`
  - `tracks : [ MMLTrack ]`

###### Events

  - `"end" : (when:number)`

### MMLTrack

###### Methods

  - `on(eventName:string, callback:function) : MMLTrack`
  - `once(eventName:string, callback:function) : MMLTrack`
  - `off(eventName:string, callback:function) : MMLTrack`

###### Events

  - `"note" : (when:number, midi:number, duration:number, noteOff:function, index:number)`
  - `"end" : (when:number)`

## Contribution

  1. Fork (https://github.com/mohayonao/wamml/fork)
  1. Create a feature branch (`git checkout -b my-new-feature`)
  1. Commit your changes (`git commit -am 'add some feature'`)
  1. Run test suite with the `gulp travis` command and confirm that it passes
  1. Push to the branch (`git push origin my-new-feature`)
  1. Create new Pull Request

## License

Wamml is available under the The MIT License.

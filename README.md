# wamml
[![NPM Version](http://img.shields.io/npm/v/wamml.svg?style=flat)](https://www.npmjs.org/package/wamml)
[![Build Status](http://img.shields.io/travis/mohayonao/wamml.svg?style=flat)](https://travis-ci.org/mohayonao/wamml)
[![Coverage Status](http://img.shields.io/coveralls/mohayonao/wamml.svg?style=flat)](https://coveralls.io/r/mohayonao/wamml?branch=master)
[![Dependency Status](http://img.shields.io/david/mohayonao/wamml.svg?style=flat)](https://david-dm.org/mohayonao/wamml)
[![devDependency Status](http://img.shields.io/david/dev/mohayonao/wamml.svg?style=flat)](https://david-dm.org/mohayonao/wamml)

> **Wamml** (wáml, ワムル) is a MML sequencer for Web Audio API.

:zap::zap::zap: work in progress :zap::zap::zap:

## Install

  - wamml.js
  - wamml.min.js

```html
<script src="/path/to/wamml.js"></script>
```

## Usage

```javascript
var mml = new wamml.MML("t120 l8 cdef gab<c >");

mml.on("note", function(when, midi, duration, noteOff) {
  var osc = audioContext.createOscillator();
  var amp = audioContext.createGain();

  osc.frequency.value = midicps(midi);
  amp.gain.linearRampToValueAtTime(0, when + duration + 0.5);

  osc.start(when);
  osc.connect(amp);
  amp.connect(audioContext.destination);

  noteOff(function() {
    amp.disconnect();
  }, 0.5); // called after noteOff + 0.5sec
});

var sequencer = new wamml.Sequencer(audioContext, mml);

sequencer.start();
```

## Features

#### Directives

```javascript
var mml = new wamml.MML("t {{ tempo }} l {{ len }} cdef gab<c >");

mml.tempo = 120;
mml.len   =   8;
```

##### avalable operators in directives

```javascript
"{{ val = 120 }}" // assignment
"{{ val +  40 }}" // binary expresion
"{{ val += 40 }}" // compound assignment
```

#### Method Call

```javascript
var mml = new wamml.MML("t120 l8 cdef @hello(10) gab<c >");

mml.hello = function(arg) {
  console.log(arg); // 10
};
```

#### Multi Tracks

```javascript
var track0 = new wamml.MML("t {{ $tempo }} l8 cdef gab<c >");
var track1 = new wamml.MML("t {{ $tempo }} l8 gab<c defg >");

var sequencer = new wamml.Sequencer(audioContext, track0, track1);

sequencer.tempo = 120; // shared directive for all tracks
sequencer.getTrack(0).on("note", noteOnFunction0);
sequencer.getTrack(1).on("note", noteOnFunction1);

sequencer.start();
```

## Syntax

###### Control

  - **t** _[number]_
    - tempo (1-511, default: 120)
  - **$**
    - infinite loop
  - **[** ... **|** ... **]** _[number]_
    - loop

###### Pitch

  - [**a**-**g**] [**-+**]? _[number]_ **.***
    - note on (1-1920, default: l)
  - **(** ( [**a**-**g**] [**-+**]? | [**<>**] )+ **)** _[number]_ **.***
    - chord (1-1920, default: l)
  - **r** _[number]_ **.***
    - rest (1-1920, default: l)
  - **o** _[number]_
    - octave (0-9, default: 5)
  - [**<>**] _[number]_
    - octave shift (1-9, default: 1)

###### Duration

  - **l** _[number]_ **.***
    - length (1-1920, default: 4)
  - **^** _[number]_ **.***
    - tie (1-1920, default: l)
  - **q** _[number]_
    - quantize (0-8, default: 6)

###### Programming

  - **//** ...
    - comment
  - **/*** ... **\*/**
    - block comment
  - **@** _identifier_ **(** _...args:[identifier|number|string]_ **)**
    - method call
  - **{{** _expression_ **}}**
    - directive

## API

### Sequencer

###### Constructor

  - `new wamml.Sequencer(audioContext:AudioContext, ... [mml:MML]) : Sequencer`

###### Methods

  - `getTrack(index:number) : MML`
  - `on(eventName:string, callback:function) : Sequencer`
  - `once(eventName:string, callback:function) : Sequencer`
  - `off(eventName:string, callback:function) : Sequencer`
  - `start() : Sequencer`
  - `stop() : Sequencer`

###### Properties

  - `context : AudioContext`
  - `currentTime : number`

###### Events

  - `"end" : (when:number)`

### MML

###### Constructor

  - `new wamml.MML(mml:string="") : MML`

###### Methods

  - `on(eventName:string, callback:function) : MML`
  - `once(eventName:string, callback:function) : MML`
  - `off(eventName:string, callback:function) : MML`

###### Properties

  - `mml : string`
  - `context : AudioContext`
  - `currentTime : number`
  - `$ : object` - variables which shared with all tracks

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

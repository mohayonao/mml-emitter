# wamml

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
var wamml = new Wamml(audioContext, "t120 l8 cdef gab<c >");

wamml.on("note:on", function(when, midi, duration) {
  var osc = audioContext.createOscillator();
  var amp = audioContext.createGain();

  osc.frequency = midicps(midi);
  amp.gain.linearRampToValueAtTime(0, when + duration);

  osc.start(when);
  osc.connect(amp);
});

wamml.start();
```

## Features

#### Mustache Bindings

```javascript
var wamml = new Wamml("$ t{{tempo}} o{{octave}} cege gab<c >");

wamml.tempo  = 125;
wamml.octave = 8;
```

#### Method Call

```javascript
var wamml = new Wamml(audioContext, "t120 cdef @hello(10) gab<c >");

wamml.hello = function(arg) {
  console.log(arg); // 10
};
```

## Syntax

###### Control

  - **t**_n_
    - tempo (1-511, default: 120)
  - **$**
    - infinite loop
  - **[** ... **|** ... **]**_n_
    - loop

###### Pitch

  - [**a**-**g**][**+-**]?_n_**.***
    - note on (1-1920, default: l)
  - **(** [**a**-**g**][**+-**]? (**,** [**a**-**g**][**+-**]?)+ **)**_n_
    - chord (1-1920, default: l)
  - **r**_n_**.***
    - rest (1-1920, default: l)
  - **o**_n_
    - octave (0-9, default: 5)
  - [**<>**]_n_
    - octave shift (1-9, default: 1)

###### Duration

  - **l**_n_**.***
    - length (1-1920, default: 4)
  - **^**_n_**.***
    - tie (1-1920, default: l)
  - **q**_n_
    - quantize (0-8, default: 6)

###### Programming

  - **//** ...
    - comment
  - **/*** ... ***/**
    - block comment
  - **@** ... **(** ...args **)**
    - method call

## API

###### Constructor

  - `new Wamml(ctx:AudioContext, mml:string="") : Wamml`

###### Methods

  - `on(eventName:string, fn:callback) : Wamml`
  - `once(eventName:string, fn:callback) : Wamml`
  - `off(eventName:string, fn:callback) : Wamml`
  - `start() : Wamml`
  - `stop() : Wamml`

###### Properties

  - `context : AudioContext`
  - `mml : string`
  - `currentTime : number`

## Contribution

  1. Fork (https://github.com/mohayonao/wamml/fork)
  1. Create a feature branch (`git checkout -b my-new-feature`)
  1. Commit your changes (`git commit -am 'add some feature'`)
  1. Run test suite with the `gulp travis` command and confirm that it passes
  1. Push to the branch (`git push origin my-new-feature`)
  1. Create new Pull Request

## License

Wamml is available under the The MIT License.

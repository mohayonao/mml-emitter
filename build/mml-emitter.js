(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MMLEmitter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require("./lib");

},{"./lib":5}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = {
  interval: 0.25,
  A4Frequency: 440,
  A4Index: 69
};
module.exports = exports["default"];
},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require("events");

var _mmlIterator = require("mml-iterator");

var _mmlIterator2 = _interopRequireDefault(_mmlIterator);

var _webAudioScheduler = require("web-audio-scheduler");

var _webAudioScheduler2 = _interopRequireDefault(_webAudioScheduler);

var _DefaultConfig = require("./DefaultConfig");

var _DefaultConfig2 = _interopRequireDefault(_DefaultConfig);

var _MMLSequencer = require("./MMLSequencer");

var _MMLSequencer2 = _interopRequireDefault(_MMLSequencer);

var _stripComments = require("strip-comments");

var _stripComments2 = _interopRequireDefault(_stripComments);

var _utilsXtend = require("./utils/xtend");

var _utilsXtend2 = _interopRequireDefault(_utilsXtend);

var _utilsToFrequency = require("./utils/toFrequency");

var _utilsToFrequency2 = _interopRequireDefault(_utilsToFrequency);

var MMLEmitter = (function (_EventEmitter) {
  _inherits(MMLEmitter, _EventEmitter);

  function MMLEmitter(source) {
    var _this = this;

    var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, MMLEmitter);

    _get(Object.getPrototypeOf(MMLEmitter.prototype), "constructor", this).call(this);

    var scheduler = config.scheduler || new _webAudioScheduler2["default"](config);
    var trackSources = (0, _stripComments2["default"])(source).split(";").filter(function (source) {
      return !!source.trim();
    });

    this.config = (0, _utilsXtend2["default"])(_DefaultConfig2["default"], config);
    this.tracks = trackSources.map(function () {
      return new _events.EventEmitter();
    });
    this.scheduler = scheduler;

    this._startTime = 0;
    this._sequencers = trackSources.map(function (source) {
      var iter = new _mmlIterator2["default"](source, _this.config);
      var sequencer = new _MMLSequencer2["default"](iter, _this.config.interval);

      sequencer.done = false;

      return sequencer;
    });
    this._done = false;
  }

  _createClass(MMLEmitter, [{
    key: "start",
    value: function start() {
      var _this2 = this;

      this._startTime = this.scheduler.currentTime;
      this.scheduler.start(function (_ref) {
        var playbackTime = _ref.playbackTime;

        _this2._progress(playbackTime);
      });

      return this;
    }
  }, {
    key: "stop",
    value: function stop() {
      this.scheduler.stop(true);

      return this;
    }
  }, {
    key: "_progress",
    value: function _progress(playbackTime) {
      var _this3 = this;

      if (this._done) {
        return;
      }

      this._sequencers.forEach(function (sequencer, trackNumber) {
        if (sequencer.done) {
          return;
        }

        var items = sequencer.next();

        _this3._emitNoteEvent(items.value, trackNumber);

        if (items.done) {
          _this3.tracks[trackNumber].emit("end", { type: "end", playbackTime: playbackTime });
          sequencer.done = true;
        }
      });

      this._done = this._sequencers.every(function (sequencer) {
        return sequencer.done;
      });

      if (this._done) {
        this.emit("end", { type: "end", playbackTime: playbackTime });
      }

      var nextPlaybackTime = playbackTime + this.config.interval;

      this.scheduler.insert(nextPlaybackTime, function (_ref2) {
        var playbackTime = _ref2.playbackTime;

        _this3._progress(playbackTime);
      });
    }
  }, {
    key: "_emitNoteEvent",
    value: function _emitNoteEvent(noteEvents, trackNumber) {
      var _this4 = this;

      noteEvents.forEach(function (noteEvent) {
        var playbackTime = _this4._startTime + noteEvent.time;
        var duration = noteEvent.duration;
        var gateTime = noteEvent.gateTime;
        var volume = noteEvent.volume;

        noteEvent.noteNumbers.forEach(function (noteNumber) {
          var frequency = (0, _utilsToFrequency2["default"])(noteNumber, _this4.config.A4Index, _this4.config.A4Frequency);
          var event = { type: "note", playbackTime: playbackTime, trackNumber: trackNumber, noteNumber: noteNumber, frequency: frequency, duration: duration, gateTime: gateTime, volume: volume };

          _this4.emit("note", event);
          _this4.tracks[trackNumber].emit("note", event);
        });
      });
    }
  }]);

  return MMLEmitter;
})(_events.EventEmitter);

exports["default"] = MMLEmitter;
module.exports = exports["default"];
},{"./DefaultConfig":2,"./MMLSequencer":4,"./utils/toFrequency":6,"./utils/xtend":7,"events":9,"mml-iterator":17,"strip-comments":30,"web-audio-scheduler":31}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MMLSequencer = (function () {
  function MMLSequencer(iter, interval) {
    _classCallCheck(this, MMLSequencer);

    this.iter = iter;
    this.interval = interval;
    this._playbackTime = 0;
    this._noteEvent = null;
    this._doneTime = 0;
    this._done = false;
  }

  _createClass(MMLSequencer, [{
    key: "next",
    value: function next() {
      var t0 = this._playbackTime + this.interval;

      if (this._done && this._doneTime < t0) {
        return { done: true, value: [] };
      }

      var result = [];
      var noteEvent = undefined;

      while ((noteEvent = this._next(t0)) !== null) {
        result.push(noteEvent);
      }

      this._playbackTime = t0;

      return { done: false, value: result };
    }
  }, {
    key: "_next",
    value: function _next(t0) {
      if (this._noteEvent) {
        return this._nextNoteEvent(t0);
      }

      var items = this.iter.next();

      if (items.done) {
        this._done = true;
        return null;
      }

      this._noteEvent = items.value;
      this._doneTime = this._noteEvent.time + this._noteEvent.duration;

      return this._next(t0);
    }
  }, {
    key: "_nextNoteEvent",
    value: function _nextNoteEvent(t0) {
      if (t0 <= this._noteEvent.time) {
        return null;
      }

      var noteEvent = this._noteEvent;

      this._noteEvent = null;

      return noteEvent;
    }
  }]);

  return MMLSequencer;
})();

exports["default"] = MMLSequencer;
module.exports = exports["default"];
},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _MMLEmitter = require("./MMLEmitter");

var _MMLEmitter2 = _interopRequireDefault(_MMLEmitter);

exports["default"] = _MMLEmitter2["default"];
module.exports = exports["default"];
},{"./MMLEmitter":3}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = toFrequency;

function toFrequency(noteNumber, a4Index, a4Frequency) {
  return a4Frequency * Math.pow(2, (noteNumber - a4Index) / 12);
}

module.exports = exports["default"];
},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = xtend;

function xtend() {
  var result = {};

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  args.forEach(function (props) {
    if (props && typeof props === "object") {
      Object.keys(props).forEach(function (key) {
        result[key] = props[key];
      });
    }
  });

  return result;
}

module.exports = exports["default"];
},{}],8:[function(require,module,exports){
/*!
 * cr <https://github.com/jonschlinkert/cr>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function(str) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }
  return str.replace(/\r\n|\r/g, '\n');
};

module.exports.strip = function(str) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }
  return str.split('\r').join('');
};

},{}],9:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],10:[function(require,module,exports){
'use strict';

var isObject = require('is-extendable');

module.exports = function extend(o/*, objects*/) {
  if (!isObject(o)) { o = {}; }

  var len = arguments.length;
  for (var i = 1; i < len; i++) {
    var obj = arguments[i];

    if (isObject(obj)) {
      assign(o, obj);
    }
  }
  return o;
};

function assign(a, b) {
  for (var key in b) {
    if (hasOwn(b, key)) {
      a[key] = b[key];
    }
  }
}

/**
 * Returns true if the given `key` is an own property of `obj`.
 */

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

},{"is-extendable":16}],11:[function(require,module,exports){
'use strict';

var extend = require('extend-shallow');
var Block = require('./lib/block');
var Line = require('./lib/line');
var utils = require('./lib/utils');

/**
 * Extract comments from the given `string`.
 *
 * ```js
 * extract(str, options);
 * ```
 * @param {String} `string`
 * @param {Object} `options` Pass `first: true` to return after the first comment is found.
 * @return {String}
 * @api public
 */

function comments(str, options, fn) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }
  return block(str, options, fn)
    .concat(line(str, options, fn))
    .sort(compare);
}

/**
 * Extract block comments from the given `string`.
 *
 * ```js
 * extract.block(str, options);
 * ```
 * @param {String} `string`
 * @param {Object} `options` Pass `first: true` to return after the first comment is found.
 * @return {String}
 * @api public
 */

function block(str, options, fn) {
  return factory('/*', '*/', Block)(str, options, fn);
}

/**
 * Extract line comments from the given `string`.
 *
 * ```js
 * extract.line(str, options);
 * ```
 * @param {String} `string`
 * @param {Object} `options` Pass `first: true` to return after the first comment is found.
 * @return {String}
 * @api public
 */

function line(str, options, fn) {
  return factory('//', '\n', Line)(str, options, fn);
}

/**
 * Factory for extracting comments from a string.
 *
 * @param {String} `string`
 * @return {String}
 */

function factory(open, close, Ctor) {
  return function(str, options, fn) {
    if (typeof str !== 'string') {
      throw new TypeError('expected a string');
    }

    if (typeof options === 'function') {
      fn = options;
      options = {};
    }

    if (typeof fn !== 'function') {
      fn = utils.identity;
    }

    var opts = extend({}, options);
    str = utils.normalize(str);
    str = utils.escapeQuoted(str);

    var res = [];
    var start = str.indexOf(open);
    var end = str.indexOf(close, start);
    var len = str.length;
    if (end === -1) {
      end = len;
    }

    while (start !== -1 && end <= len) {
      var comment = fn(new Ctor(str, start, end, open, close));
      res.push(comment);
      if (opts.first && res.length === 1) {
        return res;
      }
      start = str.indexOf(open, end + 1);
      end = str.indexOf(close, start);
      if (end === -1) {
        end = len;
      }
    }
    return res;
  };
}

/**
 * Extract the first comment from the given `string`.
 *
 * @param {String} `string`
 * @param {Object} `options` Pass `first: true` to return after the first comment is found.
 * @return {String}
 * @api public
 */

function first(str) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  var arr = comments(str, {first: true});
  if (arr && arr.length) {
    return arr[0].raw;
  } else {
    return null;
  }
}

/**
 * Utility for sorting line and block comments into
 * the correct order.
 */

function compare(a, b) {
  return a.loc.start.pos - b.loc.start.pos;
}

/**
 * Expose `extract` module
 */

module.exports = comments;

/**
 * Expose `extract.first` method
 */

module.exports.first = first;

/**
 * Expose `extract.block` method
 */

module.exports.block = block;

/**
 * Expose `extract.line` method
 */

module.exports.line = line;

/**
 * Expose `extract.factory` method
 */

module.exports.factory = factory;

},{"./lib/block":12,"./lib/line":14,"./lib/utils":15,"extend-shallow":10}],12:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var Code = require('./code');

/**
 * Create a new BlockComment with:
 *   - `str` the entire string
 *   - `idx` the starting index of the comment
 *   - `end` the ending index of the comment
 *   - `open` the opening character(s) of the comment
 *   - `close` the closing character(s) of the comment
 */

function BlockComment(str, idx, end, open, close) {
  var ol = open.length;
  var cl = close.length;

  var lineno = utils.linesCount(str, idx);
  var value = utils.restore(str.slice(idx, end + cl));
  var inner = value.slice(ol, -cl);
  var lines = utils.strip(inner.split('\n'));

  this.type = 'block';
  this.raw = value;
  this.value = lines.join('\n');
  this.lines = lines;

  this.loc = {
    start: {
      line: lineno,
      pos: idx
    },
    end: {
      line: lineno + utils.linesCount(value) - 1,
      pos: end + cl
    }
  };

  /**
   * Add code context
   */

  this.code = new Code(str, this);
}

/**
 * expose `BlockComment`
 */

module.exports = BlockComment;

},{"./code":13,"./utils":15}],13:[function(require,module,exports){
'use strict';

var codeContext = require('parse-code-context');
var utils = require('./utils');

function Code(str, comment) {
  str = utils.restore(str);
  var start = comment.loc.end.pos;
  var lineno = comment.loc.end.line;
  var ctx = {};

  var lines = str.split('\n').slice(lineno);
  for (var i = 0; i < lines.length; i++) {
    var res = codeContext(lines[i], lineno + i);
    if (res) {
      ctx = res;
      lineno += i;
      break;
    }
  }

  var val = ctx.original || '';
  var pos = str.slice(start).indexOf(val) + start;

  return {
    context: ctx,
    line: lineno,
    loc: {
      start: { line: lineno, pos: pos },
      end: { line: lineno, pos: pos + val.length }
    },
    value: val.trim()
  };
}

/**
 * Expose `Code`
 */

module.exports = Code;

},{"./utils":15,"parse-code-context":27}],14:[function(require,module,exports){
'use strict';

var utils = require('./utils');

/**
 * Create a new LineComment with:
 *   - `str` the entire string
 *   - `idx` the starting index of the comment
 *   - `end` the ending index of the comment
 *   - `open` the opening character(s) of the comment (e.g. '//')
 *   - `close` the closing character(s) of the comment (e.g. '\n')
 */

function LineComment(str, idx, end, open, close) {
  var lineno = utils.linesCount(str, idx);
  var value = utils.restore(str.slice(idx, end));

  this.type = 'line';
  this.raw = value;
  this.value = this.raw.replace(/^\s*[\/\s]+/, '');

  this.loc = {
    start: {
      line: lineno,
      pos: idx
    },
    end: {
      line: lineno + utils.linesCount(value) - 1,
      pos: end
    }
  };
}

/**
 * expose `LineComment`
 */

module.exports = LineComment;

},{"./utils":15}],15:[function(require,module,exports){
'use strict';

var cr = require('cr');
var bom = require('strip-bom-string');
var quotesRegex = require('quoted-string-regex');
var nonchar = require('noncharacters');

/**
 * Expose `utils`
 */

var utils = module.exports;

/**
 * Normalize newlines, strip carriage returns and
 * byte order marks from `str`
 */

utils.normalize = function(str) {
  return cr(bom(str));
};

/**
 * Return the given value unchanged
 */

utils.identity = function(val) {
  return val;
};

/**
 * Get the total number of lines from the start
 * of a string to the given index.
 */

utils.linesCount = function(str, i) {
  if (typeof i === 'number') {
    return str.slice(0, i).split('\n').length;
  }
  return str.split('\n').length;
};

/**
 * Utility for getting a sequence of non-characters. The
 * goal is to return a non-character string that is the
 * same length as the characters we're replacing.
 *
 * http://www.unicode.org/faq/private_use.html#noncharacters
 */

function ch(num) {
  return nonchar[num] + nonchar[num];
}

/**
 * Escaped comment characters in quoted strings
 *
 * @param {String} str
 * @return {String}
 */

utils.escapeQuoted = function(str) {
  return str.replace(quotesRegex(), function(val) {
    val = val.split('//').join(ch(0));
    val = val.split('/*').join(ch(1));
    val = val.split('*/').join(ch(2));
    return val;
  });
};

/**
 * Restore comment characters in quoted strings
 *
 * @param {String} str
 * @return {String}
 */

utils.restore = function(str) {
  return str.replace(quotesRegex(), function(val) {
    val = val.split(ch(0)).join('//');
    val = val.split(ch(1)).join('/*');
    val = val.split(ch(2)).join('*/');
    return val;
  });
};

/**
 * Strip stars from the beginning of each comment line,
 * and strip whitespace from the end of each line. We
 * can't strip whitespace from the beginning since comments
 * use markdown or other whitespace-sensitive formatting.
 *
 * @param {Array} `lines`
 * @return {Array}
 */

utils.strip = function(lines) {
  var len = lines.length, i = -1;
  var res = [];

  while (++i < len) {
    var line = lines[i].replace(/^\s*[*\/]+\s?|\s+$/g, '');
    if (!line) continue;
    res.push(line);
  }
  return res;
};

},{"cr":8,"noncharacters":26,"quoted-string-regex":28,"strip-bom-string":29}],16:[function(require,module,exports){
/*!
 * is-extendable <https://github.com/jonschlinkert/is-extendable>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function isExtendable(val) {
  return typeof val !== 'undefined' && val !== null
    && (typeof val === 'object' || typeof val === 'function');
};

},{}],17:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"./lib":23,"dup":1}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = {
  defaultTempo: 120,
  minTempo: 30,
  maxTempo: 240,
  defaultOctave: 5,
  minOctave: 0,
  maxOctave: 8,
  defaultNoteLength: 4,
  minNoteLength: 1,
  maxNoteLength: 64,
  defaultQuantize: 6,
  minQuantize: 0,
  maxQuantize: 8,
  defaultVolume: 12,
  minVolume: 0,
  maxVolume: 16,
  defaultLoopCount: 2,
  maxLoopCount: 999,
  octaveShiftDirection: 1
};
module.exports = exports["default"];
},{}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _Syntax = require("./Syntax");

var _Syntax2 = _interopRequireDefault(_Syntax);

var _DefaultConfig = require("./DefaultConfig");

var _DefaultConfig2 = _interopRequireDefault(_DefaultConfig);

var _MMLParser = require("./MMLParser");

var _MMLParser2 = _interopRequireDefault(_MMLParser);

var _utilsConstrain = require("./utils/constrain");

var _utilsConstrain2 = _interopRequireDefault(_utilsConstrain);

var _utilsXtend = require("./utils/xtend");

var _utilsXtend2 = _interopRequireDefault(_utilsXtend);

var ITERATOR = typeof Symbol !== "undefined" ? Symbol.iterator : "Symbol(Symbol.iterator)";

var MMLIterator = (function () {
  function MMLIterator(source) {
    var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, MMLIterator);

    this.source = source;
    this.config = (0, _utilsXtend2["default"])(_DefaultConfig2["default"], config);

    this._commands = new _MMLParser2["default"](source).parse();
    this._commandIndex = 0;
    this._processedTime = 0;
    this._octave = this.config.defaultOctave;
    this._noteLength = [this.config.defaultNoteLength];
    this._quantize = this.config.defaultQuantize;
    this._volume = this.config.defaultVolume;
    this._tempo = this.config.defaultTempo;
    this._infiniteLoopIndex = -1;
    this._loopStack = [];
  }

  _createClass(MMLIterator, [{
    key: "hasNext",
    value: function hasNext() {
      return this._commandIndex < this._commands.length;
    }
  }, {
    key: "forward",
    value: function forward() {
      while (this.hasNext() && this._commands[this._commandIndex].type !== _Syntax2["default"].Note) {
        var command = this._commands[this._commandIndex++];

        this[command.type](command);
      }

      return this._commands[this._commandIndex++] || {};
    }
  }, {
    key: "next",
    value: function next() {
      var command = this.forward();

      if (command.type === _Syntax2["default"].Note) {
        return { done: false, value: this[command.type](command) };
      } else {
        return { done: true, value: null };
      }
    }
  }, {
    key: ITERATOR,
    value: function value() {
      return this;
    }
  }, {
    key: "_calcDuration",
    value: function _calcDuration(noteLength) {
      var _this = this;

      if (noteLength[0] === null) {
        noteLength = this._noteLength.concat(noteLength.slice(1));
      }

      var prev = null;
      var dotted = 0;

      noteLength = noteLength.map(function (elem) {
        switch (elem) {
          case null:
            elem = prev;
            break;
          case 0:
            elem = dotted = dotted * 2;
            break;
          default:
            prev = dotted = elem;
            break;
        }

        var value = elem !== null ? elem : _this.config.defaultNoteLength;
        var length = (0, _utilsConstrain2["default"])(value, _this.config.minNoteLength, _this.config.maxNoteLength);

        return 60 / _this._tempo * (4 / length);
      });

      return noteLength.reduce(function (a, b) {
        return a + b;
      }, 0);
    }
  }, {
    key: "_calcNoteNumber",
    value: function _calcNoteNumber(noteNumber) {
      return noteNumber + this._octave * 12 + 12;
    }
  }, {
    key: _Syntax2["default"].Note,
    value: function value(command) {
      var _this2 = this;

      var time = this._processedTime;
      var duration = this._calcDuration(command.noteLength);
      var gateTime = duration * (this._quantize / this.config.maxQuantize);
      var noteNumbers = command.noteNumbers.map(function (noteNumber) {
        return _this2._calcNoteNumber(noteNumber);
      });
      var volume = this._volume / this.config.maxVolume;

      this._processedTime = this._processedTime + duration;

      return { time: time, duration: duration, gateTime: gateTime, noteNumbers: noteNumbers, volume: volume };
    }
  }, {
    key: _Syntax2["default"].Octave,
    value: function value(command) {
      var value = command.value !== null ? command.value : this.config.defaultOctave;
      var octave = (0, _utilsConstrain2["default"])(value, this.config.minOctave, this.config.maxOctave);

      this._octave = octave;
    }
  }, {
    key: _Syntax2["default"].OctaveShift,
    value: function value(command) {
      var value = command.value !== null ? command.value : 1;
      var direction = command.direction * this.config.octaveShiftDirection;
      var octave = (0, _utilsConstrain2["default"])(this._octave + value * direction, this.config.minOctave, this.config.maxOctave);

      this._octave = octave;
    }
  }, {
    key: _Syntax2["default"].NoteLength,
    value: function value(command) {
      var _this3 = this;

      var noteLength = command.noteLength.map(function (value) {
        value = value !== null ? value : _this3.config.defaultNoteLength;

        return (0, _utilsConstrain2["default"])(value, _this3.config.minNoteLength, _this3.config.maxNoteLength);
      });

      this._noteLength = noteLength;
    }
  }, {
    key: _Syntax2["default"].NoteQuantize,
    value: function value(command) {
      var value = command.value !== null ? command.value : this.config.defaultQuantize;
      var quantize = (0, _utilsConstrain2["default"])(value, this.config.minQuantize, this.config.maxQuantize);

      this._quantize = quantize;
    }
  }, {
    key: _Syntax2["default"].NoteVolume,
    value: function value(command) {
      var value = command.value !== null ? command.value : this.config.defaultVolume;
      var volume = (0, _utilsConstrain2["default"])(value, this.config.minVolume, this.config.maxVolume);

      this._volume = volume;
    }
  }, {
    key: _Syntax2["default"].Tempo,
    value: function value(command) {
      var value = command.value !== null ? command.value : this.config.defaultTempo;
      var tempo = (0, _utilsConstrain2["default"])(value, this.config.minTempo, this.config.maxTempo);

      this._tempo = tempo;
    }
  }, {
    key: _Syntax2["default"].InfiniteLoop,
    value: function value() {
      this._infiniteLoopIndex = this._commandIndex;
    }
  }, {
    key: _Syntax2["default"].LoopBegin,
    value: function value(command) {
      var value = command.value !== null ? command.value : this.config.defaultLoopCount;
      var loopCount = (0, _utilsConstrain2["default"])(value, 1, this.config.maxLoopCount);
      var loopTopIndex = this._commandIndex;
      var loopOutIndex = -1;

      this._loopStack.push({ loopCount: loopCount, loopTopIndex: loopTopIndex, loopOutIndex: loopOutIndex });
    }
  }, {
    key: _Syntax2["default"].LoopExit,
    value: function value() {
      var looper = this._loopStack[this._loopStack.length - 1];
      var index = this._commandIndex;

      if (looper.loopCount <= 1 && looper.loopOutIndex !== -1) {
        index = looper.loopOutIndex;
      }

      this._commandIndex = index;
    }
  }, {
    key: _Syntax2["default"].LoopEnd,
    value: function value() {
      var looper = this._loopStack[this._loopStack.length - 1];
      var index = this._commandIndex;

      if (looper.loopOutIndex === -1) {
        looper.loopOutIndex = this._commandIndex;
      }
      looper.loopCount -= 1;

      if (0 < looper.loopCount) {
        index = looper.loopTopIndex;
      } else {
        this._loopStack.pop();
      }

      this._commandIndex = index;
    }
  }]);

  return MMLIterator;
})();

exports["default"] = MMLIterator;
module.exports = exports["default"];
},{"./DefaultConfig":18,"./MMLParser":20,"./Syntax":22,"./utils/constrain":24,"./utils/xtend":25}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _Syntax = require("./Syntax");

var _Syntax2 = _interopRequireDefault(_Syntax);

var _Scanner = require("./Scanner");

var _Scanner2 = _interopRequireDefault(_Scanner);

var NOTE_INDEXES = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

var MMLParser = (function () {
  function MMLParser(source) {
    _classCallCheck(this, MMLParser);

    this.scanner = new _Scanner2["default"](source);
  }

  _createClass(MMLParser, [{
    key: "parse",
    value: function parse() {
      var _this = this;

      var result = [];

      this._readUntil(";", function () {
        result = result.concat(_this.advance());
      });

      return result;
    }
  }, {
    key: "advance",
    value: function advance() {
      switch (this.scanner.peek()) {
        case "c":
        case "d":
        case "e":
        case "f":
        case "g":
        case "a":
        case "b":
          return this.readNote();
        case "[":
          return this.readChord();
        case "r":
          return this.readRest();
        case "o":
          return this.readOctave();
        case "<":
          return this.readOctaveShift(+1);
        case ">":
          return this.readOctaveShift(-1);
        case "l":
          return this.readNoteLength();
        case "q":
          return this.readNoteQuantize();
        case "v":
          return this.readNoteVolume();
        case "t":
          return this.readTempo();
        case "$":
          return this.readInfiniteLoop();
        case "/":
          return this.readLoop();
      }
      this.scanner.throwUnexpectedToken();
    }
  }, {
    key: "readNote",
    value: function readNote() {
      return {
        type: _Syntax2["default"].Note,
        noteNumbers: [this._readNoteNumber(0)],
        noteLength: this._readLength()
      };
    }
  }, {
    key: "readChord",
    value: function readChord() {
      var _this2 = this;

      this.scanner.expect("[");

      var noteList = [];
      var offset = 0;

      this._readUntil("]", function () {
        switch (_this2.scanner.peek()) {
          case "c":
          case "d":
          case "e":
          case "f":
          case "g":
          case "a":
          case "b":
            noteList.push(_this2._readNoteNumber(offset));
            break;
          case "<":
            _this2.scanner.next();
            offset += 12;
            break;
          case ">":
            _this2.scanner.next();
            offset -= 12;
            break;
          default:
            _this2.scanner.throwUnexpectedToken();
        }
      });

      this.scanner.expect("]");

      return {
        type: _Syntax2["default"].Note,
        noteNumbers: noteList,
        noteLength: this._readLength()
      };
    }
  }, {
    key: "readRest",
    value: function readRest() {
      this.scanner.expect("r");

      return {
        type: _Syntax2["default"].Note,
        noteNumbers: [],
        noteLength: this._readLength()
      };
    }
  }, {
    key: "readOctave",
    value: function readOctave() {
      this.scanner.expect("o");

      return {
        type: _Syntax2["default"].Octave,
        value: this._readArgument(/\d+/)
      };
    }
  }, {
    key: "readOctaveShift",
    value: function readOctaveShift(direction) {
      this.scanner.expect(/<|>/);

      return {
        type: _Syntax2["default"].OctaveShift,
        direction: direction | 0,
        value: this._readArgument(/\d+/)
      };
    }
  }, {
    key: "readNoteLength",
    value: function readNoteLength() {
      this.scanner.expect("l");

      return {
        type: _Syntax2["default"].NoteLength,
        noteLength: this._readLength()
      };
    }
  }, {
    key: "readNoteQuantize",
    value: function readNoteQuantize() {
      this.scanner.expect("q");

      return {
        type: _Syntax2["default"].NoteQuantize,
        value: this._readArgument(/\d+/)
      };
    }
  }, {
    key: "readNoteVolume",
    value: function readNoteVolume() {
      this.scanner.expect("v");

      return {
        type: _Syntax2["default"].NoteVolume,
        value: this._readArgument(/\d+/)
      };
    }
  }, {
    key: "readTempo",
    value: function readTempo() {
      this.scanner.expect("t");

      return {
        type: _Syntax2["default"].Tempo,
        value: this._readArgument(/\d+(\.\d+)?/)
      };
    }
  }, {
    key: "readInfiniteLoop",
    value: function readInfiniteLoop() {
      this.scanner.expect("$");

      return {
        type: _Syntax2["default"].InfiniteLoop
      };
    }
  }, {
    key: "readLoop",
    value: function readLoop() {
      var _this3 = this;

      this.scanner.expect("/");
      this.scanner.expect(":");

      var result = [];
      var loopBegin = { type: _Syntax2["default"].LoopBegin };
      var loopEnd = { type: _Syntax2["default"].LoopEnd };

      result = result.concat(loopBegin);
      this._readUntil(/[|:]/, function () {
        result = result.concat(_this3.advance());
      });
      result = result.concat(this._readLoopExit());

      this.scanner.expect(":");
      this.scanner.expect("/");

      loopBegin.value = this._readArgument(/\d+/) || null;

      result = result.concat(loopEnd);

      return result;
    }
  }, {
    key: "_readUntil",
    value: function _readUntil(matcher, callback) {
      while (this.scanner.hasNext()) {
        this.scanner.forward();
        if (!this.scanner.hasNext() || this.scanner.match(matcher)) {
          break;
        }
        callback();
      }
    }
  }, {
    key: "_readArgument",
    value: function _readArgument(matcher) {
      var num = this.scanner.scan(matcher);

      return num !== null ? +num : null;
    }
  }, {
    key: "_readNoteNumber",
    value: function _readNoteNumber(offset) {
      var noteIndex = NOTE_INDEXES[this.scanner.next()];

      return noteIndex + this._readAccidental() + offset;
    }
  }, {
    key: "_readAccidental",
    value: function _readAccidental() {
      if (this.scanner.match("+")) {
        return +1 * this.scanner.scan(/\++/).length;
      }
      if (this.scanner.match("-")) {
        return -1 * this.scanner.scan(/\-+/).length;
      }
      return 0;
    }
  }, {
    key: "_readDot",
    value: function _readDot() {
      var len = (this.scanner.scan(/\.+/) || "").length;
      var result = new Array(len);

      for (var i = 0; i < len; i++) {
        result[i] = 0;
      }

      return result;
    }
  }, {
    key: "_readLength",
    value: function _readLength() {
      var result = [];

      result = result.concat(this._readArgument(/\d+/));
      result = result.concat(this._readDot());

      var tie = this._readTie();

      if (tie) {
        result = result.concat(tie);
      }

      return result;
    }
  }, {
    key: "_readTie",
    value: function _readTie() {
      this.scanner.forward();

      if (this.scanner.match("^")) {
        this.scanner.next();
        return this._readLength();
      }

      return null;
    }
  }, {
    key: "_readLoopExit",
    value: function _readLoopExit() {
      var _this4 = this;

      var result = [];

      if (this.scanner.match("|")) {
        this.scanner.next();

        var loopExit = { type: _Syntax2["default"].LoopExit };

        result = result.concat(loopExit);

        this._readUntil(":", function () {
          result = result.concat(_this4.advance());
        });
      }

      return result;
    }
  }]);

  return MMLParser;
})();

exports["default"] = MMLParser;
module.exports = exports["default"];
},{"./Scanner":21,"./Syntax":22}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Scanner = (function () {
  function Scanner(source) {
    _classCallCheck(this, Scanner);

    this.source = source;
    this.index = 0;
  }

  _createClass(Scanner, [{
    key: "hasNext",
    value: function hasNext() {
      return this.index < this.source.length;
    }
  }, {
    key: "peek",
    value: function peek() {
      return this.source.charAt(this.index) || "";
    }
  }, {
    key: "next",
    value: function next() {
      return this.source.charAt(this.index++) || "";
    }
  }, {
    key: "forward",
    value: function forward() {
      while (this.hasNext() && this.match(/\s/)) {
        this.index += 1;
      }
    }
  }, {
    key: "match",
    value: function match(matcher) {
      if (matcher instanceof RegExp) {
        return matcher.test(this.peek());
      }
      return this.peek() === matcher;
    }
  }, {
    key: "expect",
    value: function expect(matcher) {
      if (!this.match(matcher)) {
        this.throwUnexpectedToken();
      }
      this.index += 1;
    }
  }, {
    key: "scan",
    value: function scan(matcher) {
      var target = this.source.substr(this.index);
      var result = null;

      if (matcher instanceof RegExp) {
        var matched = matcher.exec(target);

        if (matched && matched.index === 0) {
          result = matched[0];
        }
      } else if (target.substr(0, matcher.length) === matcher) {
        result = matcher;
      }

      if (result) {
        this.index += result.length;
      }

      return result;
    }
  }, {
    key: "throwUnexpectedToken",
    value: function throwUnexpectedToken() {
      var identifier = this.peek() || "ILLEGAL";

      throw new SyntaxError("Unexpected token: " + identifier);
    }
  }]);

  return Scanner;
})();

exports["default"] = Scanner;
module.exports = exports["default"];
},{}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = {
  Note: "Note",
  Octave: "Octave",
  OctaveShift: "OctaveShift",
  NoteLength: "NoteLength",
  NoteQuantize: "NoteQuantize",
  NoteVolume: "NoteVolume",
  Tempo: "Tempo",
  InfiniteLoop: "InfiniteLoop",
  LoopBegin: "LoopBegin",
  LoopExit: "LoopExit",
  LoopEnd: "LoopEnd"
};
module.exports = exports["default"];
},{}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _MMLIterator = require("./MMLIterator");

var _MMLIterator2 = _interopRequireDefault(_MMLIterator);

exports["default"] = _MMLIterator2["default"];
module.exports = exports["default"];
},{"./MMLIterator":19}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = constrain;

function constrain(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(value, maxValue));
}

module.exports = exports["default"];
},{}],25:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],26:[function(require,module,exports){
/*!
 * noncharacters <https://github.com/jonschlinkert/noncharacters>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = [
  '\uFFFF',
  '\uFFFE',

  '\uFDD1',
  '\uFDD2',
  '\uFDD3',
  '\uFDD4',
  '\uFDD5',
  '\uFDD6',
  '\uFDD7',
  '\uFDD8',
  '\uFDD9',
  '\uFDDA',
  '\uFDDB',
  '\uFDDC',
  '\uFDDD',
  '\uFDDE',
  '\uFDDF',
  '\uFDE0',
  '\uFDE1',
  '\uFDE2',
  '\uFDE3',
  '\uFDE4',
  '\uFDE5',
  '\uFDE6',
  '\uFDE7',
  '\uFDE8',
  '\uFDE9',
  '\uFDEA',
  '\uFDEB',
  '\uFDEC',
  '\uFDED',
  '\uFDEE',
  '\uFDEF'
];

},{}],27:[function(require,module,exports){
/*!
 * parse-code-context <https://github.com/jonschlinkert/parse-code-context>
 * Regex originally sourced and modified from <https://github.com/visionmedia/dox>.
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (str, i) {
  var match = null;

  // function statement
  if (match = /^function[ \t]([\w$]+)[ \t]*([\w\W]+)?/.exec(str)) {
    return {
      begin: i,
      type: 'function statement',
      name: match[1],
      params: (match[2]).split(/\W/g).filter(Boolean),
      string: match[1] + '()',
      original: str
    };
    // function expression
  } else if (match = /^var[ \t]*([\w$]+)[ \t]*=[ \t]*function([\w\W]+)?/.exec(str)) {
    return {
      begin: i,
      type: 'function expression',
      name: match[1],
      params: (match[2]).split(/\W/g).filter(Boolean),
      string: match[1] + '()',
      original: str
    };
    // module.exports expression
  } else if (match = /^(module\.exports)[ \t]*=[ \t]*function[ \t]([\w$]+)[ \t]*([\w\W]+)?/.exec(str)) {
    return {
      begin: i,
      type: 'function expression',
      receiver: match[1],
      name: match[2],
      params: (match[3]).split(/\W/g).filter(Boolean),
      string: match[1] + '()',
      original: str
    };
    // module.exports method
  } else if (match = /^(module\.exports)[ \t]*=[ \t]*function([\w\W]+)?/.exec(str)) {
    return {
      begin: i,
      type: 'method',
      receiver: match[1],
      name: '',
      params: (match[2]).split(/\W/g).filter(Boolean),
      string: match[1] + '.' + match[2] + '()',
      original: str
    };
    // prototype method
  } else if (match = /^([\w$]+)\.prototype\.([\w$]+)[ \t]*=[ \t]*function([\w\W]+)?/.exec(str)) {
    return {
      begin: i,
      type: 'prototype method',
      class: match[1],
      name: match[2],
      params: (match[3]).split(/\W/g).filter(Boolean),
      string: match[1] + '.prototype.' + match[2] + '()',
      original: str
    };
    // prototype property
  } else if (match = /^([\w$]+)\.prototype\.([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(str)) {
    return {
      begin: i,
      type: 'prototype property',
      class: match[1],
      name: match[2],
      value: match[3],
      string: match[1] + '.prototype.' + match[2],
      original: str
    };
    // method
  } else if (match = /^([\w$.]+)\.([\w$]+)[ \t]*=[ \t]*function([\w\W]+)?/.exec(str)) {
    return {
      begin: i,
      type: 'method',
      receiver: match[1],
      name: match[2],
      params: (match[3]).split(/\W/g).filter(Boolean),
      string: match[1] + '.' + match[2] + '()',
      original: str
    };
    // property
  } else if (match = /^([\w$]+)\.([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(str)) {
    return {
      begin: i,
      type: 'property',
      receiver: match[1],
      name: match[2],
      value: match[3],
      string: match[1] + '.' + match[2],
      original: str
    };
    // declaration
  } else if (match = /^var[ \t]+([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(str)) {
    return {
      begin: i,
      type: 'declaration',
      name: match[1],
      value: match[2],
      string: match[1],
      original: str
    };
  }
  return null;
};

},{}],28:[function(require,module,exports){
/*!
 * quoted-string-regex <https://github.com/jonschlinkert/quoted-string-regex>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function() {
  return /'([^'\\]*\\.)*[^']*'|"([^"\\]*\\.)*[^"]*"/g;
};

},{}],29:[function(require,module,exports){
/*!
 * strip-bom-string <https://github.com/jonschlinkert/strip-bom-string>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function(str) {
  if (typeof str === 'string' && str.charAt(0) === '\ufeff') {
    return str.slice(1);
  }
  return str;
};

},{}],30:[function(require,module,exports){
'use strict';

var extract = require('extract-comments');

/**
 * Strip comments from the given `string`.
 *
 * @param {String} `string`
 * @param {Object} `options` Pass `safe: true` to keep comments with `!`
 * @return {String}
 * @api public
 */

function strip(str, options) {
  options = options || {};
  if (options.line) {
    return line(str, options);
  }
  if (options.block) {
    return block(str, options);
  }
  if (options.first) {
    return first(str, options);
  }
  str = block(str, options);
  return line(str, options);
}

/**
 * Strip block comments from the given `string`.
 *
 * @param {String} `string`
 * @param {Object} `options` Pass `safe: true` to keep comments with `!`
 * @return {String}
 * @api public
 */

function block(str, options) {
  return stripEach(str, extract.block(str, options), options);
}

/**
 * Strip line comments from the given `string`.
 *
 * @param {String} `string`
 * @param {Object} `options` Pass `safe: true` to keep comments with `!`
 * @return {String}
 * @api public
 */

function line(str, options) {
  return stripEach(str, extract.line(str, options), options);
}

/**
 * Strip the first comment from the given `string`.
 *
 * @param {String} `string`
 * @param {Object} `options` Pass `safe: true` to keep comments with `!`
 * @return {String}
 * @api public
 */

function first(str, options) {
  return stripEach(str, extract.first(str), options);
}

/**
 * Private function for stripping comments.
 *
 * @param {String} `string`
 * @param {Object} `options` Pass `safe: true` to keep comments with `!`
 * @return {String}
 */

function stripEach(str, comments, options) {
  comments.forEach(function(comment) {
    str = discard(str, comment, options);
  });
  return str;
}

/**
 * Remove a comment from the given string.
 *
 * @param {String} `string`
 * @param {Object} `options` Pass `safe: true` to keep comments with `!`
 * @return {String}
 */

function discard(str, comment, opts) {
  var ch = comment.value.charAt(0);
  if (opts && opts.safe === true && ch === '!') {
    return str;
  }
  return str.split(comment.raw).join('');
}

/**
 * Expose `strip`
 */

module.exports = strip;

/**
 * Expose methods
 */

module.exports.block = block;
module.exports.first = first;
module.exports.line = line;

},{"extract-comments":11}],31:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"./lib":34,"dup":1}],32:[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require("events");

var _utilsDefaults = require("./utils/defaults");

var _utilsDefaults2 = _interopRequireDefault(_utilsDefaults);

var _defaultContext = require("./defaultContext");

var _defaultContext2 = _interopRequireDefault(_defaultContext);

var WebAudioScheduler = (function (_EventEmitter) {
  _inherits(WebAudioScheduler, _EventEmitter);

  function WebAudioScheduler() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, WebAudioScheduler);

    _get(Object.getPrototypeOf(WebAudioScheduler.prototype), "constructor", this).call(this);

    this.context = (0, _utilsDefaults2["default"])(opts.context, _defaultContext2["default"]);
    this.interval = (0, _utilsDefaults2["default"])(opts.interval, 0.025);
    this.aheadTime = (0, _utilsDefaults2["default"])(opts.aheadTime, 0.1);
    this.timerAPI = (0, _utilsDefaults2["default"])(opts.timerAPI, global);
    this.playbackTime = this.currentTime;

    this._timerId = 0;
    this._schedId = 0;
    this._scheds = [];
  }

  _createClass(WebAudioScheduler, [{
    key: "start",
    value: function start(callback) {
      var _this = this;

      if (this._timerId === 0) {
        this._timerId = this.timerAPI.setInterval(function () {
          var t0 = _this.context.currentTime;
          var t1 = t0 + _this.aheadTime;

          _this._process(t0, t1);
        }, this.interval * 1000);

        this.emit("start");
      }

      if (callback) {
        this.insert(this.context.currentTime, callback);
      }

      return this;
    }
  }, {
    key: "stop",
    value: function stop(reset) {
      if (this._timerId !== 0) {
        this.timerAPI.clearInterval(this._timerId);
        this._timerId = 0;

        this.emit("stop");
      }

      if (reset) {
        this._scheds.splice(0);
      }

      return this;
    }
  }, {
    key: "insert",
    value: function insert(time, callback, args) {
      var id = ++this._schedId;
      var event = { id: id, time: time, callback: callback, args: args };
      var scheds = this._scheds;

      if (scheds.length === 0 || scheds[scheds.length - 1].time <= time) {
        scheds.push(event);
      } else {
        for (var i = 0, imax = scheds.length; i < imax; i++) {
          if (time < scheds[i].time) {
            scheds.splice(i, 0, event);
            break;
          }
        }
      }

      return id;
    }
  }, {
    key: "nextTick",
    value: function nextTick(time, callback, args) {
      if (typeof time === "function") {
        args = callback;
        callback = time;
        time = this.playbackTime;
      }

      return this.insert(time + this.aheadTime, callback, args);
    }
  }, {
    key: "remove",
    value: function remove(schedId) {
      var scheds = this._scheds;

      if (typeof schedId === "number") {
        for (var i = 0, imax = scheds.length; i < imax; i++) {
          if (schedId === scheds[i].id) {
            scheds.splice(i, 1);
            break;
          }
        }
      }

      return schedId;
    }
  }, {
    key: "removeAll",
    value: function removeAll() {
      this._scheds.splice(0);
    }
  }, {
    key: "_process",
    value: function _process(t0, t1) {
      var scheds = this._scheds;

      this.playbackTime = t0;
      this.emit("process", { playbackTime: this.playbackTime });

      while (scheds.length && scheds[0].time < t1) {
        var _event = scheds.shift();
        var playbackTime = _event.time;
        var args = _event.args;

        this.playbackTime = playbackTime;

        _event.callback({ playbackTime: playbackTime, args: args });
      }

      this.playbackTime = t0;
      this.emit("processed", { playbackTime: this.playbackTime });
    }
  }, {
    key: "state",
    get: function get() {
      return this._timerId !== 0 ? "running" : "suspended";
    }
  }, {
    key: "currentTime",
    get: function get() {
      return this.context.currentTime;
    }
  }, {
    key: "events",
    get: function get() {
      return this._scheds.slice();
    }
  }]);

  return WebAudioScheduler;
})(_events.EventEmitter);

exports["default"] = WebAudioScheduler;
module.exports = exports["default"];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./defaultContext":33,"./utils/defaults":35,"events":9}],33:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = Object.defineProperties({}, {
  currentTime: {
    get: function get() {
      return Date.now() / 1000;
    },
    configurable: true,
    enumerable: true
  }
});
module.exports = exports["default"];
},{}],34:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _WebAudioScheduler = require("./WebAudioScheduler");

var _WebAudioScheduler2 = _interopRequireDefault(_WebAudioScheduler);

exports["default"] = _WebAudioScheduler2["default"];
module.exports = exports["default"];
},{"./WebAudioScheduler":32}],35:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = defaults;

function defaults(value, defaultValue) {
  return value !== undefined ? value : defaultValue;
}

module.exports = exports["default"];
},{}]},{},[1])(1)
});
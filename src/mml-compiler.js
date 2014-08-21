"use strict";

var ExprCompiler = require("./expr-compiler");
var Syntax = require("./syntax");

function peek(list) {
  return list[list.length - 1];
}

function clip(num, min, max) {
  return Math.max(min, Math.min(num, max));
}

function sum(a, b) {
  return a + b;
}

function valueOf(ctx, value, defaultVal) {
  if (value !== null) {
    value = value.valueOf(ctx);
  }
  return value === null ? defaultVal : value;
}

function calcTotalDuration(ctx, length) {
  var config = ctx._config;
  var prev = null;
  var dotted = 0;

  if (length[0] === null) {
    length = ctx._lenList.concat(length.slice(1));
  }

  return length.map(function(elem) {
    if (elem === null) {
      elem = prev;
    } else if (elem === 0) {
      elem = dotted = dotted * 2;
    } else {
      prev = dotted = elem;
    }

    var length = valueOf(ctx, elem, 4);

    length = clip(length, config.minLength, config.maxLength);

    return (60 / ctx._tempo) * (4 / length);
  }).reduce(sum, 0);
}

function precompile(ctx, node) {
  if (node && typeof node === "object") {
    if (node.type === Syntax.Expression) {
      return ExprCompiler.compile(ctx, node);
    }

    if (Array.isArray(node)) {
      return node.map(function(node) {
        return precompile(ctx, node);
      });
    }

    Object.keys(node).forEach(function(key) {
      node[key] = precompile(ctx, node[key]);
    });
  }

  return node;
}

function compile(track, nodes) {
  return [].concat({ type: Syntax.Begin }, nodes, { type: Syntax.End })
    .map(function(node, index) {
      node = precompile(track, node);
      return compile[node.type](node, index);
    });
}

compile[Syntax.Begin] = function() {
  return function(ctx, currentTime) {
    ctx._tempo    = ctx._config.defaultTempo;
    ctx._octave   = ctx._config.defaultOctave;
    ctx._quantize = ctx._config.defaultQuantize;
    ctx._volume   = ctx._config.defaultVolume;
    ctx._length   = ctx._config.defaultLength;
    ctx._lenList  = [ ctx._length ];
    ctx._loopStack = [];
    ctx._infLoopPos  = null;
    ctx._infLoopWhen = currentTime;
    ctx._noteIndex = 0;

    return currentTime;
  };
};

compile[Syntax.End] = function() {
  return function(ctx, currentTime) {
    if (ctx._infLoopPos !== null) {
      if (ctx._infLoopWhen !== currentTime) {
        ctx._pos = ctx._infLoopPos;
      }
    } else {
      ctx._recv({
        type: "end",
        when: currentTime
      }, { bubble: true });
    }

    return currentTime;
  };
};

compile[Syntax.Note] = function(node) {
  return function(ctx, currentTime) {
    var config = ctx._config;
    var totalDuration = calcTotalDuration(ctx, node.length);
    var duration = totalDuration * (ctx._quantize / config.maxQuantize);

    var noteIndex = ctx._noteIndex;
    var isChord = node.note.length > 1;

    if (node.note.length) {
      ctx._noteIndex += 1;
    }

    node.note.forEach(function(note, index) {
      var midi, frequency;

      midi = note.noteNum + note.acci;
      midi += ctx._octave * 12;
      midi += config.A4Index - 57;

      frequency = config.A4Frequency;
      frequency *= Math.pow(2, (midi - config.A4Index) * 1 / 12);

      function noteOff(fn, offset) {
        ctx._recv({
          type: "sched",
          when: currentTime + duration + (offset || 0),
          callback: fn
        }, { private: true });
      }

      ctx._recv({
        type: "note",
        index: noteIndex,
        when: currentTime,
        nextWhen: currentTime + totalDuration,
        midi: midi,
        frequency: frequency,
        noteNum: note.noteNum,
        accidental: note.acci,
        duration: duration,
        isChord: isChord,
        chordIndex: index,
        tempo: ctx._tempo,
        volume: ctx._volume,
        octave: ctx._octave,
        length: ctx._length,
        quantize: ctx._quantize,
        noteOff: noteOff,
      });
    });

    return currentTime + totalDuration;
  };
};

compile[Syntax.Octave] = function(node) {
  return function(ctx, currentTime) {
    var config = ctx._config;
    var octave = valueOf(ctx, node.value, config.defaultOctave);

    ctx._octave = clip(octave, config.minOctave, config.maxOctave);

    return currentTime;
  };
};

compile[Syntax.OctaveShift] = function(node) {
  return function(ctx, currentTime) {
    var config = ctx._config;
    var octave = ctx._octave;

    octave += node.direction * config.octaveShiftDirection * valueOf(ctx, node.value, 1);
    ctx._octave = clip(octave, config.minOctave, config.maxOctave);

    return currentTime;
  };
};

compile[Syntax.Length] = function(node) {
  return function(ctx, currentTime) {
    var config = ctx._config;

    ctx._lenList = node.length.map(function(node) {
      var length = valueOf(ctx, node, config.defaultLength);
      return clip(length, config.minLength, config.maxLength);
    }, this);
    ctx._length  = ctx._lenList[0];

    return currentTime;
  };
};

compile[Syntax.Quantize] = function(node) {
  return function(ctx, currentTime) {
    var config = ctx._config;
    var quantize = valueOf(ctx, node.value, config.defaultQuantize);

    ctx._quantize = clip(quantize, config.minQuantize, config.maxQuantize);

    return currentTime;
  };
};

compile[Syntax.Tempo] = function(node) {
  return function(ctx, currentTime) {
    var config = ctx._config;
    var tempo = valueOf(ctx, node.value, config.defaultTempo);

    ctx._tempo = clip(tempo, config.minTempo, config.maxTempo);

    return currentTime;
  };
};

compile[Syntax.Volume] = function(node) {
  return function(ctx, currentTime) {
    var config = ctx._config;
    var volume = valueOf(ctx, node.value, config.defaultVolume);

    ctx._volume = clip(volume, config.minVolume, config.maxVolume);

    return currentTime;
  };
};

compile[Syntax.InfLoop] = function(node, index) {
  return function(ctx, currentTime) {
    ctx._infLoopPos  = index;
    ctx._infLoopWhen = currentTime;

    return currentTime;
  };
};

compile[Syntax.LoopBegin] = function(node, index) {
  return function(ctx, currentTime) {
    ctx._loopStack.push([
      clip(valueOf(ctx, node.value, 2), 1, 999), index, null
    ]);

    return currentTime;
  };
};

compile[Syntax.LoopExit] = function() {
  return function(ctx, currentTime) {
    var looper = peek(ctx._loopStack);

    if (looper[0] <= 1 && looper[2] !== null) {
      ctx._pos = looper[2];
    }

    return currentTime;
  };
};

compile[Syntax.LoopEnd] = function(node, index) {
  return function(ctx, currentTime) {
    var looper = peek(ctx._loopStack);

    if (looper[2] === null) {
      looper[2] = index;
    }

    looper[0] -= 1;

    if (looper[0] > 0) {
      ctx._pos = looper[1];
    } else {
      ctx._loopStack.pop();
    }

    return currentTime;
  };
};

compile[Syntax.Command] = function(node) {
  return function(ctx, currentTime) {
    valueOf(ctx, node.value, 0);
    return currentTime;
  };
};

module.exports.compile = compile;

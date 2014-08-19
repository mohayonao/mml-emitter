"use strict";

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

function calcTotalDuration(ctx, length) {
  var prev = 0, dotted = 0;

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
    return (60 / ctx._tempo) * (4 / clip(elem, 1, 1920));
  }).reduce(sum, 0);
}

var compile = {};

function Compiler(track) {
  this._track = track;
}

Compiler.prototype.compile = function(nodes) {
  return [].concat({ type: Syntax.Begin }, nodes, { type: Syntax.End })
    .map(function(node, index) {
      return compile[node.type](node, index);
    });
};

compile[Syntax.Begin] = function() {
  return function(ctx, currentTime) {
    ctx._tempo    = 120;
    ctx._octave   = 5;
    ctx._quantize = 6;
    ctx._length   = 4;
    ctx._lenList  = [ ctx._length ];
    ctx._loopStack = [];
    ctx._infLoopIndex = null;
    ctx._infLoopWhen  = currentTime;

    return currentTime;
  };
};

compile[Syntax.End] = function() {
  return function(ctx, currentTime) {
    if (ctx._infLoopIndex !== null) {
      if (ctx._infLoopWhen !== currentTime) {
        ctx._index = ctx._infLoopIndex;
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
    var totalDuration = calcTotalDuration(ctx, node.length);
    var duration = totalDuration * (ctx._quantize / 8);

    node.number.forEach(function(number, index) {
      var midi = ctx._octave * 12 + number + 12;

      function noteOff(fn, offset) {
        ctx._recv({
          type: "sched",
          when: currentTime + duration + (offset || 0),
          callback: fn
        }, { private: true });
      }

      ctx._recv({
        type: "note",
        when: currentTime,
        midi: midi,
        duration: duration,
        noteOff: noteOff,
        chordIndex: index
      });
    });

    return currentTime + totalDuration;
  };
};

compile[Syntax.Octave] = function(node) {
  return function(ctx, currentTime) {
    ctx._octave = clip(node.value, 0, 8);

    return currentTime;
  };
};

compile[Syntax.OctaveShift] = function(node) {
  return function(ctx, currentTime) {
    var octave = ctx._octave + node.direction * node.value;
    ctx._octave = clip(octave, 0, 8);
    return currentTime;
  };
};

compile[Syntax.Length] = function(node) {
  return function(ctx, currentTime) {
    ctx._length  = node.length[0];
    ctx._lenList = node.length;

    return currentTime;
  };
};

compile[Syntax.Quantize] = function(node) {
  return function(ctx, currentTime) {
    ctx._quantize = clip(node.value, 0, 8);

    return currentTime;
  };
};

compile[Syntax.Tempo] = function(node) {
  return function(ctx, currentTime) {
    ctx._tempo = clip(node.value, 1, 511);

    return currentTime;
  };
};

compile[Syntax.InfLoop] = function(node, index) {
  return function(ctx, currentTime) {
    ctx._infLoopIndex = index;
    ctx._infLoopWhen  = currentTime;

    return currentTime;
  };
};

compile[Syntax.LoopBegin] = function(node, index) {
  return function(ctx, currentTime) {
    ctx._loopStack.push([
      clip(node.value, 1, 999), index, null
    ]);

    return currentTime;
  };
};

compile[Syntax.LoopExit] = function() {
  return function(ctx, currentTime) {
    var looper = peek(ctx._loopStack);

    if (looper[0] <= 1 && looper[2] !== null) {
      ctx._index = looper[2];
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
      ctx._index = looper[1];
    } else {
      ctx._loopStack.pop();
    }

    return currentTime;
  };
};

module.exports = Compiler;

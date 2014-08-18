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

function calcTotalDuration(list, state) {
  var prev = 0, dotted = 0;

  if (list[0] === null) {
    list = state.length.concat(list.slice(1));
  }

  return list.map(function(elem) {
    if (elem === null) {
      elem = prev;
    } else if (elem === 0) {
      elem = dotted = dotted * 2;
    } else {
      prev = dotted = elem;
    }
    return (60 / state.tempo) * (4 / clip(elem, 1, 1920));
  }).reduce(sum, 0);
}

function compile(nodes) {
  return [].concat({ type: Syntax.Begin }, nodes, { type: Syntax.End })
    .map(function(node, index) {
      return compile[node.type](node, index);
    });
}

compile[Syntax.Begin] = function() {
  return function(currentTime, state) {
    state.tempo    = 120;
    state.octave   = 5;
    state.quantize = 6;
    state.length   = [ 4 ];
    state.pendings = [];
    state.loopStack = [];
    state.infLoopIndex = null;
    state.infLoopWhen  = currentTime;

    return currentTime;
  };
};

compile[Syntax.End] = function() {
  return function(currentTime, state) {
    if (state.infLoopIndex !== null) {
      if (state.infLoopWhen !== currentTime) {
        state.index = state.infLoopIndex;
      }
    } else {
      state.postMessage({
        type: "end",
        when: currentTime
      }, { bubble: true });
    }
  };
};

compile[Syntax.Note] = function(node) {
  return function(currentTime, state) {
    state.pendings.splice(0).forEach(function(fn) {
      fn(state);
    });

    var totalDuration = calcTotalDuration(node.length, state);
    var duration = totalDuration * (state.quantize / 8);

    node.number.forEach(function(number, index) {
      var midi = state.octave * 12 + number + 12;

      function noteOff(fn, offset) {
        state.postMessage({
          type: "sched",
          when: currentTime + duration + (offset || 0),
          callback: fn
        }, { private: true });
      }

      state.postMessage({
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
  return function(currentTime, state) {
    state.pendings.push(function(state) {
      state.octave = clip(node.value, 0, 8);
    });
  };
};

compile[Syntax.OctaveShift] = function(node) {
  return function(currentTime, state) {
    state.pendings.push(function(state) {
      var octave = state.octave + node.direction * node.value;
      state.octave = clip(octave, 0, 8);
    });
  };
};

compile[Syntax.Length] = function(node) {
  return function(currentTime, state) {
    state.pendings.push(function(state) {
      state.length = node.length;
    });
  };
};

compile[Syntax.Quantize] = function(node) {
  return function(currentTime, state) {
    state.pendings.push(function(state) {
      state.quantize = clip(node.value, 0, 8);
    });
  };
};

compile[Syntax.Tempo] = function(node) {
  return function(currentTime, state) {
    state.pendings.push(function(state) {
      state.tempo = clip(node.value, 1, 511);
    });
  };
};

compile[Syntax.InfLoop] = function(node, index) {
  return function(currentTime, state) {
    state.infLoopIndex = index;
    state.infLoopWhen  = currentTime;
  };
};

compile[Syntax.LoopBegin] = function(node, index) {
  return function(currentTime, state) {
    state.loopStack.push([
      clip(node.value, 1, 999), index, null
    ]);
  };
};

compile[Syntax.LoopExit] = function() {
  return function(currentTime, state) {
    var looper = peek(state.loopStack);

    if (looper[0] <= 1 && looper[2] !== null) {
      state.index = looper[2];
    }
  };
};

compile[Syntax.LoopEnd] = function(node, index) {
  return function(currentTime, state) {
    var looper = peek(state.loopStack);

    if (looper[2] === null) {
      looper[2] = index;
    }

    looper[0] -= 1;

    if (looper[0] > 0) {
      state.index = looper[1];
    } else {
      state.loopStack.pop();
    }
  };
};

module.exports = function(nodes) {
  return compile(nodes);
};

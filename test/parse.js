"use strict";

var parse = require("../src/parse");
var Syntax = require("../src/syntax");

describe("parse", function() {
  var testCase = {
    "": [],
    "\n\n": [],
    "////\n////": [],
    "/* //*\n\n**/ */": [],
    "/*": new SyntaxError("Unexpected token ILLEGAL"),
    "日本語": new SyntaxError("Unexpected token: '日'"),
    "c d e": [[
      {
        type: Syntax.Note,
        number: [ 0 ],
        length: [ null ]
      },
      {
        type: Syntax.Note,
        number: [ 2 ],
        length: [ null ]
      },
      {
        type: Syntax.Note,
        number: [ 4 ],
        length: [ null ]
      },
    ]],
    "f+ b-": [[
      {
        type: Syntax.Note,
        number: [ 6 ],
        length: [ null ]
      },
      {
        type: Syntax.Note,
        number: [ 10 ],
        length: [ null ]
      }
    ]],
    "f4 g8..": [[
      {
        type: Syntax.Note,
        number: [ 5 ],
        length: [ 4 ],
      },
      {
        type: Syntax.Note,
        number: [ 7 ],
        length: [ 8, 0, 0 ],
      },
    ]],
    "b ^4": [[
      {
        type: Syntax.Note,
        number: [ 11 ],
        length: [ null, 4 ]
      }
    ]],
    "c ^^": [[
      {
        type: Syntax.Note,
        number: [ 0 ],
        length: [ null, null, null ]
      }
    ]],
    "c 4": new SyntaxError("Unexpected token: '4'"),
    "c4 ^ 8": new SyntaxError("Unexpected token: '8'"),
    "[ceg]": [[
      {
        type: Syntax.Note,
        number: [ 0, 4, 7 ],
        length: [ null ]
      }
    ]],
    "[ g<ce ]": [[
      {
        type: Syntax.Note,
        number: [ 7, 12, 16 ],
        length: [ null ]
      }
    ]],
    "[c > g e]": [[
      {
        type: Syntax.Note,
        number: [ 0, -5, -8 ],
        length: [ null ]
      }
    ]],
    "[dfa]4.": [[
      {
        type: Syntax.Note,
        number: [ 2, 5, 9 ],
        length: [ 4, 0 ]
      }
    ]],
    "[c4. eg]": new SyntaxError("Unexpected token: '4'"),
    "[fa<ce": new SyntaxError("Unexpected token ILLEGAL"),
    "[ceg] 4": new SyntaxError("Unexpected token: '4'"),
    "r": [[
      {
        type: Syntax.Note,
        number: [],
        length: [ null ]
      }
    ]],
    "r4": [[
      {
        type: Syntax.Note,
        number: [],
        length: [ 4 ]
      }
    ]],
    "r4. ^8": [[
      {
        type: Syntax.Note,
        number: [],
        length: [ 4, 0, 8 ]
      }
    ]],
    "r 4": new SyntaxError("Unexpected token: '4'"),
    "o": [[
      {
        type: Syntax.Octave,
        value: 5
      }
    ]],
    "o4": [[
      {
        type: Syntax.Octave,
        value: 4
      }
    ]],
    "o 4": new SyntaxError("Unexpected token: '4'"),
    ">> <": [[
      {
        type: Syntax.OctaveShift,
        direction: -1,
        value: 1
      },
      {
        type: Syntax.OctaveShift,
        direction: -1,
        value: 1
      },
      {
        type: Syntax.OctaveShift,
        direction: +1,
        value: 1
      }
    ]],
    "<2": [[
      {
        type: Syntax.OctaveShift,
        direction: +1,
        value: 2
      }
    ]],
    "> 4": new SyntaxError("Unexpected token: '4'"),
    "l": [[
      {
        type: Syntax.Length,
        length: [ 4 ]
      }
    ]],
    "l4": [[
      {
        type: Syntax.Length,
        length: [ 4 ]
      }
    ]],
    "l4. ^8": [[
      {
        type: Syntax.Length,
        length: [ 4, 0, 8 ]
      }
    ]],
    "l8^^": [[
      {
        type: Syntax.Length,
        length: [ 8, null, null ]
      }
    ]],
    "l 4": new SyntaxError("Unexpected token: '4'"),
    "q": [[
      {
        type: Syntax.Quantize,
        value: 6
      }
    ]],
    "q2": [[
      {
        type: Syntax.Quantize,
        value: 2
      }
    ]],
    "q 4": new SyntaxError("Unexpected token: '4'"),
    "t": [[
      {
        type: Syntax.Tempo,
        value: 120
      }
    ]],
    "t125.5": [[
      {
        type: Syntax.Tempo,
        value: 125.5
      }
    ]],
    "t 120": new SyntaxError("Unexpected token: '1'"),
    "$": [[
      {
        type: Syntax.InfLoop
      }
    ]],
    "/: a :/": [[
      {
        type: Syntax.LoopBegin,
        value: 2
      },
      {
        type: Syntax.Note,
        number: [ 9 ],
        length: [ null ]
      },
      {
        type: Syntax.LoopEnd
      }
    ]],
    "/: c |d :/": [[
      {
        type: Syntax.LoopBegin,
        value: 2
      },
      {
        type: Syntax.Note,
        number: [ 0 ],
        length: [ null ]
      },
      {
        type: Syntax.LoopExit
      },
      {
        type: Syntax.Note,
        number: [ 2 ],
        length: [ null ]
      },
      {
        type: Syntax.LoopEnd
      }
    ]],
    "/: c| d :/4": [[
      {
        type: Syntax.LoopBegin,
        value: 4
      },
      {
        type: Syntax.Note,
        number: [ 0 ],
        length: [ null ]
      },
      {
        type: Syntax.LoopExit
      },
      {
        type: Syntax.Note,
        number: [ 2 ],
        length: [ null ]
      },
      {
        type: Syntax.LoopEnd
      }
    ]],
    "/: c /: d /: e :/ :/ | f :/4": [[
      {
        type: Syntax.LoopBegin,
        value: 4
      },
      {
        type: Syntax.Note,
        number: [ 0 ],
        length: [ null ]
      },
      {
        type: Syntax.LoopBegin,
        value: 2
      },
      {
        type: Syntax.Note,
        number: [ 2 ],
        length: [ null ]
      },
      {
        type: Syntax.LoopBegin,
        value: 2
      },
      {
        type: Syntax.Note,
        number: [ 4 ],
        length: [ null ]
      },
      {
        type: Syntax.LoopEnd
      },
      {
        type: Syntax.LoopEnd
      },
      {
        type: Syntax.LoopExit
      },
      {
        type: Syntax.Note,
        number: [ 5 ],
        length: [ null ]
      },
      {
        type: Syntax.LoopEnd
      }
    ]],
    "/:": new SyntaxError("Unexpected token ILLEGAL"),
    ":/": new SyntaxError("Unexpected token: ':'"),
    "|": new SyntaxError("Unexpected token: '|'"),
    "/:c:/ 4": new SyntaxError("Unexpected token: '4'"),
    "c; e; g;": [
      [
        {
          type: Syntax.Note,
          number: [ 0 ],
          length: [ null ]
        }
      ], [
        {
          type: Syntax.Note,
          number: [ 4 ],
          length: [ null ]
        }
      ], [
        {
          type: Syntax.Note,
          number: [ 7 ],
          length: [ null ]
        },
      ]
    ]
  };

  Object.keys(testCase).forEach(function(mml) {
    if (testCase[mml] instanceof Error) {
      it("'" + CR(mml) + "' throws " + testCase[mml].message, function() {
        expect(function() {
          parse(mml);
        }).throw(testCase[mml].constructor, testCase[mml].message);
      });
    } else {
      it("'" + CR(mml) + "'", function() {
        expect(parse(mml)).to.eql(testCase[mml]);
      });
    }
  });

  function CR(mml) {
    return mml.replace(/\n/g, "↵ ");
  }

});

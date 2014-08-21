"use strict";

var MMLParser = require("../src/mml-parser");
var Syntax = require("../src/syntax");

describe("MMLParser", function() {
  describe(".parse(string)", function() {
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
          note: [
            { noteNum: 0, acci: 0}
          ],
          length: [ null ]
        },
        {
          type: Syntax.Note,
          note: [
            { noteNum: 2, acci: 0 }
          ],
          length: [ null ]
        },
        {
          type: Syntax.Note,
          note: [
            { noteNum: 4, acci: 0 }
          ],
          length: [ null ]
        },
      ]],
      "f+ b-": [[
        {
          type: Syntax.Note,
          note: [
            { noteNum: 5, acci: 1 }
          ],
          length: [ null ]
        },
        {
          type: Syntax.Note,
          note: [
            { noteNum: 11, acci: -1 }
          ],
          length: [ null ]
        }
      ]],
      "f4 g8..": [[
        {
          type: Syntax.Note,
          note: [
            { noteNum: 5, acci: 0 }
          ],
          length: [ 4 ],
        },
        {
          type: Syntax.Note,
          note: [
            { noteNum: 7, acci: 0 }
          ],
          length: [ 8, 0, 0 ],
        },
      ]],
      "b ^4": [[
        {
          type: Syntax.Note,
          note: [
            { noteNum: 11, acci: 0 }
          ],
          length: [ null, 4 ]
        }
      ]],
      "c ^^": [[
        {
          type: Syntax.Note,
          note: [
            { noteNum: 0, acci: 0 }
          ],
          length: [ null, null, null ]
        }
      ]],
      "c 4": new SyntaxError("Unexpected token: '4'"),
      "c4 ^ 8": new SyntaxError("Unexpected token: '8'"),
      "[ceg]": [[
        {
          type: Syntax.Note,
          note: [
            { noteNum: 0, acci: 0 },
            { noteNum: 4, acci: 0 },
            { noteNum: 7, acci: 0 }
          ],
          length: [ null ]
        }
      ]],
      "[ g<ce ]": [[
        {
          type: Syntax.Note,
          note: [
            { noteNum:  7, acci: 0 },
            { noteNum: 12, acci: 0 },
            { noteNum: 16, acci: 0 }
          ],
          length: [ null ]
        }
      ]],
      "[c > g e]": [[
        {
          type: Syntax.Note,
          note: [
            { noteNum:  0, acci: 0 },
            { noteNum: -5, acci: 0 },
            { noteNum: -8, acci: 0 }
          ],
          length: [ null ]
        }
      ]],
      "[dfa]4.": [[
        {
          type: Syntax.Note,
          note: [
            { noteNum: 2, acci: 0 },
            { noteNum: 5, acci: 0 },
            { noteNum: 9, acci: 0 }
          ],
          length: [ 4, 0 ]
        }
      ]],
      "[c4. eg]": new SyntaxError("Unexpected token: '4'"),
      "[fa<ce": new SyntaxError("Unexpected token ILLEGAL"),
      "[ceg] 4": new SyntaxError("Unexpected token: '4'"),
      "r": [[
        {
          type: Syntax.Note,
          note: [],
          length: [ null ]
        }
      ]],
      "r4": [[
        {
          type: Syntax.Note,
          note: [],
          length: [ 4 ]
        }
      ]],
      "r4. ^8": [[
        {
          type: Syntax.Note,
          note: [],
          length: [ 4, 0, 8 ]
        }
      ]],
      "r 4": new SyntaxError("Unexpected token: '4'"),
      "o": [[
        {
          type: Syntax.Octave,
          value: null
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
          value: null
        },
        {
          type: Syntax.OctaveShift,
          direction: -1,
          value: null
        },
        {
          type: Syntax.OctaveShift,
          direction: +1,
          value: null
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
          length: [ null ]
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
          value: null
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
          value: null
        }
      ]],
      "t125.5": [[
        {
          type: Syntax.Tempo,
          value: 125.5
        }
      ]],
      "t 120": new SyntaxError("Unexpected token: '1'"),
      "v2": [[
        {
          type: Syntax.Volume,
          value: 2
        }
      ]],
      "v 4": new SyntaxError("Unexpected token: '4'"),
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
          note: [
            { noteNum: 9, acci: 0 }
          ],
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
          note: [
            { noteNum:0, acci: 0 }
          ],
          length: [ null ]
        },
        {
          type: Syntax.LoopExit
        },
        {
          type: Syntax.Note,
          note: [
            { noteNum: 2, acci: 0 }
          ],
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
          note: [
            { noteNum: 0, acci: 0 }
          ],
          length: [ null ]
        },
        {
          type: Syntax.LoopExit
        },
        {
          type: Syntax.Note,
          note: [
            { noteNum: 2, acci: 0 }
          ],
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
          note: [
            { noteNum: 0, acci: 0 }
          ],
          length: [ null ]
        },
        {
          type: Syntax.LoopBegin,
          value: 2
        },
        {
          type: Syntax.Note,
          note: [
            { noteNum: 2, acci: 0 }
          ],
          length: [ null ]
        },
        {
          type: Syntax.LoopBegin,
          value: 2
        },
        {
          type: Syntax.Note,
          note: [
            { noteNum: 4, acci: 0 }
          ],
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
          note: [
            { noteNum: 5, acci: 0 }
          ],
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
      "@(a)": [[
        {
          type: Syntax.Command,
          value: {
            type: Syntax.Expression,
            expr: "this.a",
            variables: [ "a" ]
          }
        }
      ]],
      "@(_a)": new SyntaxError("A variable in directives should not be started with '_': _a"),
      "l(4)^(a).": [[
        {
          type: Syntax.Length,
          length: [
            {
              type: Syntax.Expression,
              expr: "4",
              variables: []
            },
            {
              type: Syntax.Expression,
              expr: "this.a",
              variables: [ "a" ]
            },
            0
          ]
        }
      ]],
      "c; e; g;": [
        [
          {
            type: Syntax.Note,
            note: [
              { noteNum: 0, acci: 0 }
            ],
            length: [ null ]
          }
        ], [
          {
            type: Syntax.Note,
            note: [
              { noteNum: 4, acci: 0 }
            ],
            length: [ null ]
          }
        ], [
          {
            type: Syntax.Note,
            note: [
              { noteNum: 7, acci: 0 }
            ],
            length: [ null ]
          },
        ]
      ]
    };

    Object.keys(testCase).forEach(function(mml) {
      if (testCase[mml] instanceof Error) {
        it("'" + CR(mml) + "' throws " + testCase[mml].message, function() {
          expect(function() {
            MMLParser.parse(mml);
          }).throw(testCase[mml].constructor, testCase[mml].message);
        });
      } else {
        it("'" + CR(mml) + "'", function() {
          expect(MMLParser.parse(mml)).to.eql(testCase[mml]);
        });
      }
    });

    function CR(mml) {
      return mml.replace(/\n/g, "↵ ");
    }

  });
});

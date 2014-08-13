"use strict";

var mmlParser = require("../../src/mml-parser");
var Syntax = mmlParser.Syntax;

describe("mml-parser", function() {

  function error(msg, index, lineNumber, column) {
    var err = new SyntaxError(msg);

    err.index = index;
    err.lineNumber = lineNumber;
    err.column = column;

    return err;
  }

  var testCase = {
    "": {
      type: Syntax.MML,
      list: []
    },
    "/* /* ** \n // */ */": {
      type: Syntax.MML,
      list: []
    },
    "//\n//": {
      type: Syntax.MML,
      list: []
    },
    // "/* /*": error("Unexpected token ILLEGAL", 5, 1, 1),
    "c d e": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Note,
          number: 0,
          length: null,
          dot: 0,
          tie: null
        },
        {
          type: Syntax.Note,
          number: 2,
          length: null,
          dot: 0,
          tie: null
        },
        {
          type: Syntax.Note,
          number: 4,
          length: null,
          dot: 0,
          tie: null
        },
      ]
    },
    "f+ g8 a. b-16..": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Note,
          number: 5 + 1,
          length: null,
          dot: 0,
          tie: null
        },
        {
          type: Syntax.Note,
          number: 7,
          length: {
            type: Syntax.Number,
            value: 8
          },
          dot: 0,
          tie: null
        },
        {
          type: Syntax.Note,
          number: 9,
          length: null,
          dot: 1,
          tie: null
        },
        {
          type: Syntax.Note,
          number: 11 - 1,
          length: {
            type: Syntax.Number,
            value: 16
          },
          dot: 2,
          tie: null
        },
      ]
    },
    "c8 ^ 16 ^ ..": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Note,
          number: 0,
          length: {
            type: Syntax.Number,
            value: 8
          },
          dot: 0,
          tie: {
            type: Syntax.Tie,
            value: {
              type: Syntax.Number,
              value: 16
            },
            dot: 0,
            tie: {
              type: Syntax.Tie,
              value: null,
              dot: 2,
              tie: null
            }
          }
        }
      ]
    },
    "(ceg)": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Chord,
          list: [
            {
              type: Syntax.Note,
              number: 0
            },
            {
              type: Syntax.Note,
              number: 4
            },
            {
              type: Syntax.Note,
              number: 7
            },
          ],
          length: null,
          dot: 0,
          tie: null
        }
      ]
    },
    "(ce-g+)": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Chord,
          list: [
            {
              type: Syntax.Note,
              number: 0
            },
            {
              type: Syntax.Note,
              number: 4 - 1
            },
            {
              type: Syntax.Note,
              number: 7 + 1
            },
          ],
          length: null,
          dot: 0,
          tie: null
        }
      ]
    },
    "(eg<c)": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Chord,
          list: [
            {
              type: Syntax.Note,
              number: 4
            },
            {
              type: Syntax.Note,
              number: 7
            },
            {
              type: Syntax.Note,
              number: 12
            },
          ],
          length: null,
          dot: 0,
          tie: null
        }
      ]
    },
    "(c>ge)": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Chord,
          list: [
            {
              type: Syntax.Note,
              number: 0
            },
            {
              type: Syntax.Note,
              number: -5
            },
            {
              type: Syntax.Note,
              number: -8
            },
          ],
          length: null,
          dot: 0,
          tie: null
        }
      ]
    },
    "(ceg)8 ^ 16 ^ ..": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Chord,
          list: [
            {
              type: Syntax.Note,
              number: 0
            },
            {
              type: Syntax.Note,
              number: 4
            },
            {
              type: Syntax.Note,
              number: 7
            },
          ],
          length: {
            type: Syntax.Number,
            value: 8
          },
          dot: 0,
          tie: {
            type: Syntax.Tie,
            value: {
              type: Syntax.Number,
              value: 16
            },
            dot: 0,
            tie: {
              type: Syntax.Tie,
              value: null,
              dot: 2,
              tie: null
            }
          }
        }
      ]
    },
    "r r2..": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Rest,
          length: null,
          dot: 0,
          tie: null
        },
        {
          type: Syntax.Rest,
          length: {
            type: Syntax.Number,
            value: 2
          },
          dot: 2,
          tie: null
        }
      ]
    },
    "r8 ^ 16 ^ ..": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Rest,
          length: {
            type: Syntax.Number,
            value: 8
          },
          dot: 0,
          tie: {
            type: Syntax.Tie,
            value: {
              type: Syntax.Number,
              value: 16
            },
            dot: 0,
            tie: {
              type: Syntax.Tie,
              value: null,
              dot: 2,
              tie: null
            }
          }
        }
      ]
    },
    "o o8": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Octave,
          value: null
        },
        {
          type: Syntax.Octave,
          value: {
            type: Syntax.Number,
            value: 8
          }
        }
      ]
    },
    "< <2 >2 >": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.OctaveShift,
          direction: +1,
          value: null
        },
        {
          type: Syntax.OctaveShift,
          direction: +1,
          value: {
            type: Syntax.Number,
            value: 2
          }
        },
        {
          type: Syntax.OctaveShift,
          direction: -1,
          value: {
            type: Syntax.Number,
            value: 2
          }
        },
        {
          type: Syntax.OctaveShift,
          direction: -1,
          value: null
        },
      ]
    },
    "l l2..": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Length,
          value: null,
          dot: 0,
          tie: null
        },
        {
          type: Syntax.Length,
          value: {
            type: Syntax.Number,
            value: 2
          },
          dot: 2,
          tie: null
        }
      ]
    },
    "l8 ^ 16 ^ ..": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Length,
          value: {
            type: Syntax.Number,
            value: 8
          },
          dot: 0,
          tie: {
            type: Syntax.Tie,
            value: {
              type: Syntax.Number,
              value: 16
            },
            dot: 0,
            tie: {
              type: Syntax.Tie,
              value: null,
              dot: 2,
              tie: null
            }
          }
        }
      ]
    },
    "q q4": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Quantize,
          value: null
        },
        {
          type: Syntax.Quantize,
          value: {
            type: Syntax.Number,
            value: 4
          }
        }
      ]
    },
    "t t120 t120.5": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Tempo,
          value: null
        },
        {
          type: Syntax.Tempo,
          value: {
            type: Syntax.Number,
            value: 120
          }
        },
        {
          type: Syntax.Tempo,
          value: {
            type: Syntax.Number,
            value: 120.5
          }
        },
      ]
    },
    "cd $ ec": {
      type: Syntax.MML,
      list: [
        {
          type: Syntax.Note,
          number: 0,
          length: null,
          dot: 0,
          tie: null
        },
        {
          type: Syntax.Note,
          number: 2,
          length: null,
          dot: 0,
          tie: null
        },
        {
          type: Syntax.InfLoop,
          list: [
            {
              type: Syntax.Note,
              number: 4,
              length: null,
              dot: 0,
              tie: null
            },
            {
              type: Syntax.Note,
              number: 0,
              length: null,
              dot: 0,
              tie: null
            },
          ]
        }
      ]
    }
  };

  Object.keys(testCase).forEach(function(mml) {
    it("parse('" + mml + "')", function() {
      if (testCase[mml] instanceof Error) {
        expect(function() {
          mmlParser.parse(mml);
        }).throw(testCase[mml]);
      } else {
        expect(mmlParser.parse(mml)).to.eql(testCase[mml]);
      }
    });
  });

});

"use strict";

global.chai   = require("chai");
global.expect = global.chai.expect;

require("./AudioContextShim");
global.MMLEmitter = require("../../");

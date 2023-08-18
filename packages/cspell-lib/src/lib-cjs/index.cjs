"use strict";
/**
 * This module contains CJS only files.
 * It includes files that use 3rd part libs that can only be CJS due to their exports.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveGlobal = exports.requireResolve = exports.srcDirectory = void 0;
var pkg_info_cjs_1 = require("./pkg-info.cjs");
Object.defineProperty(exports, "srcDirectory", { enumerable: true, get: function () { return pkg_info_cjs_1.srcDirectory; } });
var requireResolve_cjs_1 = require("./requireResolve.cjs");
Object.defineProperty(exports, "requireResolve", { enumerable: true, get: function () { return requireResolve_cjs_1.requireResolve; } });
Object.defineProperty(exports, "resolveGlobal", { enumerable: true, get: function () { return requireResolve_cjs_1.resolveGlobal; } });

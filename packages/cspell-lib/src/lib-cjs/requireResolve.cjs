"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireResolve = exports.resolveGlobal = void 0;
const global_dirs_1 = require("global-dirs");
function resolveGlobal(modulesName) {
    const paths = [global_dirs_1.npm.packages, global_dirs_1.yarn.packages];
    return requireResolve(modulesName, paths);
}
exports.resolveGlobal = resolveGlobal;
function requireResolve(filename, paths) {
    try {
        return require.resolve(filename, paths ? { paths } : undefined);
    } catch (e) {
        return undefined;
    }
}
exports.requireResolve = requireResolve;

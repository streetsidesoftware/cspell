"use strict";
const vscode_uri_1 = require("vscode-uri");
const minimatch = require("minimatch");
const separator = '/';
function extractGlobsFromExcludeFilesGlobMap(globMap) {
    const globs = Object.getOwnPropertyNames(globMap)
        .filter(glob => globMap[glob]);
    return globs;
}
exports.extractGlobsFromExcludeFilesGlobMap = extractGlobsFromExcludeFilesGlobMap;
function pathToUri(filePath) {
    return vscode_uri_1.default.file(filePath).toString();
}
exports.pathToUri = pathToUri;
function generateExclusionFunctionForUri(globs, root) {
    const rootUri = pathToUri(root || '/');
    const fns = globs.map(glob => minimatch.filter(glob, { matchBase: true }));
    function testPath(path) {
        return fns.reduce((prev, fn) => prev || fn(path), false);
    }
    function testPathStepByStep(path) {
        const parts = path.split(separator);
        for (let i = 0; i < parts.length; ++i) {
            const p = parts.slice(0, i + 1).join(separator);
            if (testPath(p)) {
                return true;
            }
        }
        return false;
    }
    function testUriPath(uriPath) {
        const uri = vscode_uri_1.default.parse(uriPath);
        if (uri.scheme !== 'file') {
            return true;
        }
        const relativeRoot = uriPath.slice(0, rootUri.length);
        if (relativeRoot === rootUri) {
            const relativeToRoot = uriPath.slice(rootUri.length);
            return testPathStepByStep(relativeToRoot);
        }
        // the uri is not relative to the root.
        return testPathStepByStep(uri.path);
    }
    return testUriPath;
}
exports.generateExclusionFunctionForUri = generateExclusionFunctionForUri;
//# sourceMappingURL=exclusionHelper.js.map
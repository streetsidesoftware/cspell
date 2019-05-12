"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const exclusionHelper_1 = require("./exclusionHelper");
// cSpell:words filepath
describe('Verify Exclusion Helper functions', function () {
    it('checks extractGlobsFromExcludeFilesGlobMap', function () {
        const excludeDef = {
            '**/node_modules': true,
            '**/typings': true,
        };
        chai_1.expect(exclusionHelper_1.extractGlobsFromExcludeFilesGlobMap(excludeDef), 'get list of globs').is.deep.equal(['**/node_modules', '**/typings']);
    });
    it('Test the generated matching function', function () {
        const globs = [
            '**/node_modules',
            '**/typings',
            '.vscode',
        ];
        const filesMatching = [
            'file:///project/myProject/node_modules',
            'file:///project/myProject/node_modules/test/test.js',
            'file:///project/myProject/.vscode/cSpell.json',
        ];
        const fn = exclusionHelper_1.generateExclusionFunctionForUri(globs, '/project/myProject');
        filesMatching.forEach(filepath => {
            const r = fn(filepath);
            chai_1.expect(r, `Path: ${filepath} to not be included.`).to.be.true;
        });
    });
    it('Test the generated matching function for nested projects', function () {
        const globs = [
            '**/node_modules',
            '**/typings',
            '.vscode',
        ];
        const filesMatching = [
            'file:///User/projects/myProject/node_modules/test/test.js',
            'file:///User/projects/myProject/node_modules/test/test.json',
            'untitled:///User/projects/myProject/node_modules/test/test.js',
        ];
        const fn = exclusionHelper_1.generateExclusionFunctionForUri(globs, '/User/projects/myProject/node_modules/test');
        filesMatching.forEach(filepath => {
            const r = fn(filepath);
            chai_1.expect(r, `Path: ${filepath} to not be excluded.`).to.be.false;
        });
    });
    it('Test against generated files', function () {
        const globs = [
            'debug:/**',
            '**/*.rendered',
            'git-index:/**',
        ];
        const files = [
            'debug://internal/1014/extHostCommands.ts',
            'file:///project/myProject/README.md.rendered',
            'git-index:///projects/myProject/node_modules/test/test.js',
            'git-index:///projects/myProject/node_modules/test/test.json',
        ];
        const fn = exclusionHelper_1.generateExclusionFunctionForUri(globs, '/project/myProject');
        files.forEach(filepath => {
            const r = fn(filepath);
            chai_1.expect(r, `Path: ${filepath} to not be included.`).to.be.true;
        });
    });
    it('Test to make sure normal files are loaded', function () {
        const globs = [
            'debug:/**',
            'vscode:/**',
            'private:/**',
            'markdown:/**',
            '**/*.rendered',
            '**/*.*.rendered',
        ];
        const files = [
            'file:///src/extHostCommands.ts',
            'file:///test/test.ts',
        ];
        const fn = exclusionHelper_1.generateExclusionFunctionForUri(globs, '/project/myProject');
        files.forEach(filepath => {
            const r = fn(filepath);
            chai_1.expect(r, `Path: ${filepath} to not be excluded.`).to.be.false;
        });
    });
});
//# sourceMappingURL=exclusionHelper.test.js.map
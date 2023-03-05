import { describe, expect, test } from 'vitest';

import * as index from './index.js';
import {
    contains,
    directoryRoot,
    findRepoRoot,
    GitIgnore,
    GitIgnoreFile,
    GitIgnoreHierarchy,
    isParentOf,
    loadGitIgnore,
} from './index.js';

describe('index', () => {
    test('index', () => {
        expect(index).toBeDefined();
    });
    test.each`
        value                        | expected
        ${typeof GitIgnore}          | ${'function'}
        ${typeof GitIgnoreFile}      | ${'function'}
        ${typeof GitIgnoreHierarchy} | ${'function'}
        ${typeof loadGitIgnore}      | ${'function'}
        ${typeof isParentOf}         | ${'function'}
        ${typeof contains}           | ${'function'}
        ${typeof findRepoRoot}       | ${'function'}
        ${typeof directoryRoot}      | ${'function'}
    `('exports', ({ value, expected }) => {
        expect(value).toEqual(expected);
    });
});

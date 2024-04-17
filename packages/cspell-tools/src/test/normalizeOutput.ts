import * as path from 'node:path';

import { escapeRegEx } from './escapeRegEx.js';
import { test_dirname } from './TestHelper.js';

const _dirname = test_dirname(import.meta.url);

const rootCspellTools = path.join(_dirname, '../..');
const rootRepo = path.join(rootCspellTools, '../..');

/**
 * Example: `2022-10-02T17:10:04.681Z`
 */
const regexpDate = /\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/gi;

const rxRootRepo = new RegExp(escapeRegEx(rootRepo) + '|' + escapeRegEx(normalizeDirectorySeparator(rootRepo)), 'gi');

export function normalizeOutput(output: string, cwd = process.cwd()): string {
    const rxCwd = new RegExp(escapeRegEx(cwd) + '|' + escapeRegEx(normalizeDirectorySeparator(cwd)), 'gi');

    const normalizeDirs = normalizeDirectorySeparator(
        output.replace(rxCwd, '{cwd}').replace(rxRootRepo, '{repo-root}'),
    );

    return normalizeDirs.replace(regexpDate, '2022-01-01T00:00:00.000Z');
}

export function normalizeDirectorySeparator(path: string): string {
    return path.replace(/\\/g, '/');
}

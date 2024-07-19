import { posix, win32 } from 'node:path';

import strip from 'strip-ansi';
import { describe, expect, test, vi } from 'vitest';

import type { TraceResult } from '../application.js';
import { console } from '../console.js';
import { __testing__, calcTraceResultsReport, emitTraceResults } from './traceEmitter.js';

const compareStr = Intl.Collator().compare;

describe('traceEmitter', () => {
    test('empty', () => {
        const report = calcTraceResultsReport('empty', false, [], {
            cwd: '/',
            lineWidth: 80,
            dictionaryPathFormat: 'long',
            iPath: posix,
        });
        expect(strip(report.table)).toEqual('Word F Dictionary Dictionary Location');
    });

    test('posix format long', () => {
        const lineWidth = 80;
        const report = calcTraceResultsReport('errorcode', true, sampleResults(), {
            cwd: '/this_is_a_very/long/path',
            lineWidth,
            dictionaryPathFormat: 'long',
            iPath: posix,
        });
        const lines = report.table.split('\n').map(strip);
        expect(lines.reduce((a, b) => Math.max(a, b.length), 0)).toBeLessThanOrEqual(lineWidth);
        const output = lines.join('\n');
        expect(output).toEqual(`\
Word       F Dictionary        Dictionary Location
errorcode  ! forbid-words*     ../forbid-words.txt
errorcode  I ignore-words*     ../../ignore-words.txt
error+code * my-special-words* which/should/.../the/space/my-special-words.txt
errorcode  * project-words     project-words.txt
errorcode  - softwareTerms*    node_modules/@cspell/.../dict/softwareTerms.txt`);
    });

    test('posix format short', () => {
        const consoleLines: string[] = [];
        vi.spyOn(console, 'log').mockImplementation((a) => consoleLines.push(strip(a)));
        const lineWidth = 80;
        emitTraceResults('errorcode', true, sampleResults(), {
            cwd: '/this_is_a_very/long/path',
            lineWidth,
            dictionaryPathFormat: 'short',
            iPath: posix,
        });
        const lines = consoleLines.join('\n').split('\n');
        expect(lines.reduce((a, b) => Math.max(a, b.length), 0)).toBeLessThanOrEqual(lineWidth);
        expect(lines).toEqual([
            'Word       F Dictionary        Dictionary Location',
            'errorcode  ! forbid-words*     ../forbid-words.txt',
            'errorcode  I ignore-words*     .../ignore-words.txt',
            'error+code * my-special-words* my-special-words.txt',
            'errorcode  * project-words     project-words.txt',
            'errorcode  - softwareTerms*    [node_modules]/softwareTerms.txt',
        ]);
    });

    test('win32 format long', () => {
        const consoleLines: string[] = [];
        vi.spyOn(console, 'log').mockImplementation((a) => consoleLines.push(strip(a)));
        const lineWidth = 80;
        emitTraceResults('errorcode', true, sampleResultsWin32(), {
            cwd: 'D:/this_is_a_very/long/path',
            lineWidth,
            dictionaryPathFormat: 'long',
            iPath: win32,
        });
        const lines = consoleLines.join('\n').split('\n');
        expect(lines.reduce((a, b) => Math.max(a, b.length), 0)).toBeLessThanOrEqual(lineWidth);
        const output = lines.join('\n');
        expect(output).toEqual(
            bs(`\
Word       F Dictionary        Dictionary Location
errorcode  ! forbid-words*     ../forbid-words.txt
errorcode  I ignore-words*     ../../ignore-words.txt
error+code * my-special-words* which/should/.../the/space/my-special-words.txt
errorcode  * project-words     project-words.txt
errorcode  - softwareTerms*    node_modules/@cspell/.../dict/softwareTerms.txt`),
        );
    });

    test('win32 format full', () => {
        const lines: string[] = [];
        vi.spyOn(console, 'log').mockImplementation((a) => lines.push(strip(a)));
        const lineWidth = 80;
        emitTraceResults('errorcode', true, sampleResultsWin32(), {
            cwd: 'D:/this_is_a_very/long/path',
            lineWidth,
            dictionaryPathFormat: 'full',
            iPath: win32,
            showWordFound: true,
        });
        expect(lines.reduce((a, b) => Math.max(a, b.length), 0)).toBeGreaterThan(lineWidth);
        const output = lines.join('\n');
        expect(output).toEqual(
            bs(
                `\
errorcode: Found
Word       F Dictionary        Dictionary Location
errorcode  ! forbid-words*     D:/this_is_a_very/long/forbid-words.txt
errorcode  I ignore-words*     D:/this_is_a_very/ignore-words.txt
error+code * my-special-words* D:/this_is_a_very/long/path/which/should/not/fit/fully/into/the/space/my-special-words.txt
errorcode  * project-words     D:/this_is_a_very/long/path/project-words.txt
errorcode  - softwareTerms*    D:/this_is_a_very/long/path/node_modules/@cspell/dict-software-terms/dict/softwareTerms.txt`,
            ),
        );
    });
});

describe('trimMidPath', () => {
    test.each`
        path                      | width | expected
        ${''}                     | ${20} | ${''}
        ${'0123456789'}           | ${7}  | ${'01...89'}
        ${'0123/56789'}           | ${7}  | ${'01...89'}
        ${'0123/56789'}           | ${9}  | ${'.../56789'}
        ${'0123/56789/1234/6789'} | ${20} | ${'0123/56789/1234/6789'}
        ${'0123/89/77/1234/6789'} | ${19} | ${'0123/.../1234/6789'}
        ${'0123/8/7/1gh1234/689'} | ${19} | ${'0123/8/7/.../689'}
    `('trimMidPath', ({ path, width, expected }) => {
        expect(__testing__.trimMidPath(path, width, '/')).toBe(expected);
    });
});

const _sampleResults: TraceResult[] = [
    {
        word: 'errorcode', // cspell:ignore errorcode
        found: true,
        foundWord: 'error+code',
        forbidden: false,
        noSuggest: false,
        dictName: 'my-special-words',
        dictActive: true,
        dictSource: '/this_is_a_very/long/path/which/should/not/fit/fully/into/the/space/my-special-words.txt',
        configSource: 'the config source',
        preferredSuggestions: undefined,
        errors: undefined,
    },
    {
        word: 'errorcode', // cspell:ignore errorcode
        found: true,
        foundWord: 'errorcode',
        forbidden: false,
        noSuggest: false,
        dictName: 'project-words',
        dictActive: false,
        dictSource: '/this_is_a_very/long/path/project-words.txt',
        configSource: 'the config source',
        preferredSuggestions: undefined,
        errors: undefined,
    },
    {
        word: 'errorcode', // cspell:ignore errorcode
        found: true,
        foundWord: 'errorcode',
        forbidden: true,
        noSuggest: false,
        dictName: 'forbid-words',
        dictActive: true,
        dictSource: '/this_is_a_very/long/forbid-words.txt',
        configSource: 'the config source',
        preferredSuggestions: undefined,
        errors: undefined,
    },
    {
        word: 'errorcode', // cspell:ignore errorcode
        found: true,
        foundWord: 'errorcode',
        forbidden: false,
        noSuggest: true,
        dictName: 'ignore-words',
        dictActive: true,
        dictSource: '/this_is_a_very/ignore-words.txt',
        configSource: 'the config source',
        preferredSuggestions: undefined,
        errors: undefined,
    },
    {
        word: 'errorcode', // cspell:ignore errorcode
        found: false,
        foundWord: undefined,
        forbidden: false,
        noSuggest: false,
        dictName: 'softwareTerms',
        dictActive: true,
        dictSource: '/this_is_a_very/long/path/node_modules/@cspell/dict-software-terms/dict/softwareTerms.txt',
        configSource: 'the config source',
        preferredSuggestions: undefined,
        errors: undefined,
    },
];

function sampleResults() {
    return _sampleResults.sort((a, b) => compareStr(a.dictName, b.dictName));
}

function sampleResultsWin32() {
    return sampleResults().map((r) => ({ ...r, dictSource: win32.resolve('D:', r.dictSource) }));
}

function bs(s: string, sep = win32.sep) {
    return s.replaceAll('/', sep);
}

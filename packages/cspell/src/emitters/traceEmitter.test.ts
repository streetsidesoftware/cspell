import { emitTraceResults } from './traceEmitter';
import strip from 'strip-ansi';
import type { TraceResult } from '../application';

describe('traceEmitter', () => {
    test('empty', () => {
        const lines: string[] = [];
        jest.spyOn(console, 'log').mockImplementation((a) => lines.push(strip(a)));
        emitTraceResults([], { cwd: '/', lineWidth: 80 });
        expect(lines).toEqual(['Word F Dictionary           Dictionary Location           ']);
    });

    test('narrow screen with compound words', () => {
        const lines: string[] = [];
        jest.spyOn(console, 'log').mockImplementation((a) => lines.push(strip(a)));
        const lineWidth = 80;
        emitTraceResults(sampleResults(), { cwd: '/this_is_a_very/long/path', lineWidth });
        expect(lines.reduce((a, b) => Math.max(a, b.length), 0)).toBeLessThanOrEqual(lineWidth);
        expect(lines).toEqual([
            'Word       F Dictionary           Dictionary Location           ',
            'errorcode  ! forbid-words*        forbid-words.txt',
            'errorcode  I ignore-words*        ignore-words.txt',
            expect.stringContaining('error+code * my-special-words*    '),
            'errorcode  * project-words        project-words.txt',
        ]);
        const out = lines.join('\n');
        expect(out).toEqual(expect.stringContaining('my-special-words.txt\n'));
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
        dictSource: '/this_is_a_very/long/path/forbid-words.txt',
        configSource: 'the config source',
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
        dictSource: '/this_is_a_very/long/path/ignore-words.txt',
        configSource: 'the config source',
        errors: undefined,
    },
];

function sampleResults() {
    return _sampleResults;
}

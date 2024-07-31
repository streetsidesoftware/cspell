import { readFile } from 'node:fs/promises';
import { extname } from 'node:path/posix';

import { TextOffset } from '@cspell/cspell-types';
import { suite } from 'perf-insight';

import { extractPossibleWordsFromTextOffset, extractWordsFromCode, extractWordsFromText, textOffset } from './text.js';
import { regExWordsAndDigits } from './textRegex.js';

const regExpWord = /\b[\w\p{L}\p{M}]+\b/gu;

suite('wordSplitter', async (test) => {
    const lines = await sampleLines();

    const iterations = 1;

    test('baseline: matchAll /[\\w\\p{L}\\p{M}]+/gu', () => {
        const s: TextOffset[] = [];
        const _regExpWord = regExpWord;
        for (let i = iterations; i > 0; --i) {
            for (const line of lines) {
                for (const m of line.matchAll(_regExpWord)) {
                    s.push({ text: m[0], offset: m.index });
                }
            }
        }
        return s;
    });

    test('baseline: matchAll non-space /\\S+/g', () => {
        const s: TextOffset[] = [];
        const regExp = /\S+/g;
        for (let i = iterations; i > 0; --i) {
            for (const line of lines) {
                s.push(...[...line.matchAll(regExp)].map((a) => ({ text: a[0], offset: a.index })));
            }
        }
        return s;
    });

    test('baseline: matchAll non-special', () => {
        const s: TextOffset[] = [];
        const regExp = /[^\s();:{}[\]*&^%$#@!~"?/\\,<>+=]+/g;
        for (let i = iterations; i > 0; --i) {
            for (const line of lines) {
                s.push(...[...line.matchAll(regExp)].map((a) => ({ text: a[0], offset: a.index })));
            }
        }
        return s;
    });

    test('baseline: matchAll regExWordsAndDigits', () => {
        const s: TextOffset[] = [];
        const regExp = regExWordsAndDigits;
        for (let i = iterations; i > 0; --i) {
            for (const line of lines) {
                s.push(...[...line.matchAll(regExp)].map((a) => ({ text: a[0], offset: a.index })));
            }
        }
        return s;
    });

    test('matchAll into possible words', () => {
        const s: TextOffset[] = [];
        const regExpMaybeWord = /[^\s();:{}[\]*&^%$#@!~"?/\\,<>+=]+/g;
        const _regExpWord = regExpWord;
        for (let i = iterations; i > 0; --i) {
            for (const line of lines) {
                for (const m of line.matchAll(regExpMaybeWord)) {
                    const index = m.index;
                    for (const words of m[0].matchAll(_regExpWord)) {
                        s.push({ text: words[0], offset: index + words.index });
                    }
                }
            }
        }
        return s;
    });

    test('extractWordsFromText', () => {
        const s: TextOffset[] = [];
        for (let i = iterations; i > 0; --i) {
            for (const line of lines) {
                s.push(...extractWordsFromText(line));
            }
        }
        return s;
    });

    test('extractPossibleWordsFromTextOffset', () => {
        const s: TextOffset[] = [];
        for (let i = iterations; i > 0; --i) {
            for (const line of lines) {
                s.push(...extractPossibleWordsFromTextOffset(textOffset(line)));
            }
        }
        return s;
    });

    test('extractWordsFromCode', () => {
        const s: TextOffset[] = [];
        for (let i = iterations; i > 0; --i) {
            for (const line of lines) {
                s.push(...extractWordsFromCode(line));
            }
        }
        return s;
    });
});

async function sampleLines() {
    const ext = extname(new URL(import.meta.url).pathname);
    const url = new URL('wordSplitter.test' + ext, import.meta.url);
    const context = await readFile(url, 'utf8');
    return context.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n');
}

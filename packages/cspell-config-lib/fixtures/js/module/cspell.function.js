import { promises as fs } from 'fs';

function expand(pattern, options = { begin: '(', end: ')', sep: '|' }, start = 0) {
    const len = pattern.length;
    const parts = [];
    function push(word) {
        if (Array.isArray(word)) {
            parts.push(...word);
        } else {
            parts.push(word);
        }
    }
    let i = start;
    let curWord = '';
    while (i < len) {
        const ch = pattern[i++];
        if (ch === options.end) {
            break;
        }
        if (ch === options.begin) {
            const nested = expand(pattern, options, i);
            i = nested.idx;
            curWord = nested.parts.flatMap((p) => (Array.isArray(curWord) ? curWord.map((w) => w + p) : [curWord + p]));
            continue;
        }
        if (ch === options.sep) {
            push(curWord);
            curWord = '';
            continue;
        }
        curWord = Array.isArray(curWord) ? curWord.map((w) => w + ch) : curWord + ch;
    }
    push(curWord);
    return { parts, idx: i };
}

function expandWord(pattern, options = { begin: '(', end: ')', sep: '|' }) {
    return expand(pattern, options).parts;
}

function expandWords(wordList) {
    const words = wordList
        .split(/\n/g)
        .map((w) => w.trim())
        .filter((w) => !!w && !w.startsWith('#'))
        .flatMap((w) => expandWord(w));
    return words;
}

/**
 * @returns {Promise<import('@cspell/cspell-types').CSpellUserSettings>}
 */
export default async function getConfig() {
    const wordsFile = new URL('words.txt', import.meta.url);

    const wordList = await fs.readFile(wordsFile, 'utf8');

    const config = {
        id: 'config-function',
        words: expandWords(wordList),
    };
    return config;
}

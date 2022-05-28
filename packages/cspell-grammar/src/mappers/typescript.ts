/**
 * Mappers for TypeScript and JavaScript
 */

import { MappedText } from './types';

const hexChars: Record<string, number | undefined> = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    A: 10,
    B: 11,
    C: 12,
    D: 13,
    E: 14,
    F: 15,
    a: 10,
    b: 11,
    c: 12,
    d: 13,
    e: 14,
    f: 15,
};

const escapeChars: Record<string, string | undefined> = {
    t: '\t',
    n: '\n',
    r: '\r',
    b: '\b',
    '\\': '\\',
    '"': '"',
    "'": "'",
};

export function mapRawString(text: string): MappedText {
    const end = text.length;
    let t = '';
    const map: number[] = [];
    const isHex = /^[0-9a-fA-F]+$/;
    let i: number, j: number;
    for (i = 0, j = 0; i < end; ++i) {
        let parsed: number;
        const ti = text[i];
        if (ti === '\\') {
            map.push(i, j);
            const tc = text[++i];
            const ec = escapeChars[tc];
            if (ec) {
                t += ec;
                j += ec.length;
                map.push(i, j);
                continue;
            }
            switch (tc) {
                case 'u':
                    {
                        let char: string;
                        let end: number;
                        if (text[i + 1] !== '{') {
                            const digits = text.slice(i + 1, i + 5);
                            parsed = isHex.test(digits) ? parseInt(digits, 16) : NaN;
                            char = isNaN(parsed) ? '' : String.fromCharCode(parsed);
                            end = i + 4;
                        } else {
                            for (end = i + 2; text[end] in hexChars; ++end) {
                                // do nothing
                            }
                            if (text[end] !== '}') {
                                char = '';
                            } else {
                                const digits = text.slice(i + 2, end);
                                parsed = isHex.test(digits) ? parseInt(digits, 16) : NaN;
                                char = isNaN(parsed) ? '' : String.fromCodePoint(parsed);
                            }
                        }
                        if (!char) {
                            t += tc;
                            j += 1;
                        } else {
                            t += char;
                            j += char.length;
                            i = end;
                        }
                    }
                    break;
                case 'x':
                    {
                        const digits = text.slice(i + 1, i + 3);
                        parsed = isHex.test(digits) ? parseInt(digits, 16) : NaN;
                        if (isNaN(parsed)) {
                            // give up, it is not valid
                            t += tc;
                            j += 1;
                        } else {
                            t += String.fromCharCode(parsed);
                            i += 2;
                            ++j;
                        }
                    }
                    break;
                case '0':
                    // Deprecated in ES5
                    t += '0';
                    j += 1;
                    break;
                default:
                    t += tc;
                    ++j;
                    break;
            }
            map.push(i + 1, j);
            continue;
        }
        t += ti;
        ++j;
    }

    if (map.length) {
        const ii = map[map.length - 2];
        const jj = map[map.length - 1];
        if (ii !== i || jj !== j) {
            map.push(i, j);
        }
    }

    return {
        text: t,
        map,
    };
}

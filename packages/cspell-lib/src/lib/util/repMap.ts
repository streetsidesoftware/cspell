import type { ReplaceMap } from '@cspell/cspell-types';

import { escapeRegEx } from './regexHelper';

export type ReplaceMapper = (src: string) => string;

export function createMapper(repMap: ReplaceMap): ReplaceMapper {
    const filteredMap = repMap.filter(([match, _]) => !!match);
    if (!filteredMap.length) {
        return (a) => a;
    }
    const regExStr = filteredMap
        .map(([from, _]) => from)
        // make sure it compiles into a regex
        .map((s) => {
            try {
                // fix up any nested ()
                const r = s.match(/\(/) ? s.replace(/\((?=.*\))/g, '(?:').replace(/\(\?:\?/g, '(?') : s;
                new RegExp(r);
                s = r;
            } catch (err) {
                return escapeRegEx(s);
            }
            return s;
        })
        .map((s) => `(${s})`)
        .join('|');

    const regEx = new RegExp(regExStr, 'g');
    const values = repMap.filter(([match, _]) => !!match).map(([_, into]) => into);

    function resolve(m: string, ...matches: unknown[]) {
        const index = matches.findIndex((a) => !!a);
        return 0 <= index && index < values.length ? values[index] : m;
    }

    return function (s: string) {
        return s.replace(regEx, resolve);
    };
}

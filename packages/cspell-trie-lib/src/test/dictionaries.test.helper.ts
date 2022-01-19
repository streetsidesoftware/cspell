import { Trie } from '../lib/trie';
import { readTrieFileFromConfig, readTrieFile } from './reader.test.helper';
import * as path from 'path';
import { resolveGlobalSample, resolveGlobalDict } from './samples';
import { AffInfo, readAffFile } from 'hunspell-reader';
import { SuggestionCostMapDef, WeightMap } from '..';
import { createWeightMap } from '../lib/distance/weightedMaps';

const tries = new Map<string, Promise<Trie>>();

export function readTrie(name: string): Promise<Trie> {
    return memorize(name, tries, (name) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pkgLocation = require.resolve(name);
        return readTrieFileFromConfig(pkgLocation);
    });
}

const sampleTries = new Map<string, Promise<Trie>>();
const samplesLocation = resolveGlobalSample('dicts');

export function readSampleTrie(name: string): Promise<Trie> {
    return memorize(name, sampleTries, (name) => readTrieFile(path.resolve(samplesLocation, name)));
}

function memorize<V>(key: string, map: Map<string, V>, resolve: (key: string) => V): V {
    const v = map.get(key);
    if (v) return v;
    const r = resolve(key);
    map.set(key, r);
    return r;
}

export function readAff(name: string): Promise<AffInfo> {
    return readAffFile(resolveGlobalDict(name));
}

export function affToWeightMap(aff: AffInfo): WeightMap {
    return createWeightMap(...cvtAffToSuggestionMap(aff));
}

export function cvtAffToSuggestionMap(aff: AffInfo): SuggestionCostMapDef[] {
    const convCost = 2;
    const mapCost = 11;
    const repCost = 50;
    const capsCost = 1;
    // const keyboardCost = 99;
    const doublesCost = 71;

    const conv = (aff.ICONV || []).concat(aff.OCONV || []);
    const maps = aff.MAP || [];
    const reps = aff.REP || [];

    function convToDef() {
        const map = conv.map(({ from, to }) => `(${from})(${to})`.normalize()).join('|');
        return { map, replace: convCost };
    }

    function mapsToDef() {
        return { map: maps.join('|').normalize(), replace: mapCost };
    }

    function repsToDef() {
        const map = reps.map(({ match, replaceWith }) => `(${match})(${replaceWith})`.normalize()).join('|');
        return { map, replace: repCost };
    }

    function tryToDef() {
        const tryField = (aff.TRY || '').normalize();
        const pairs = tryField
            .split('')
            .map((a) => [a.toLowerCase(), a.toUpperCase()])
            .filter(([a, b]) => a !== b)
            .map((a) => a.join(''));
        return {
            map: pairs.join('|'),
            replace: capsCost,
        };
    }

    function baseCostDef() {
        const tryField = (aff.TRY || '').normalize();
        return {
            map: tryField + tryField.toUpperCase() + tryField.toLowerCase(),
            insDel: 99,
            replace: 99,
        };
    }

    function doubleLetters() {
        const tryField = (aff.TRY || '').normalize();
        const pairs = tryField.split('').map((a) => a + '(' + a + a + ')');
        return {
            map: pairs.join('|'),
            replace: doublesCost,
        };
    }

    // function keysToDef() {
    //     const keys = (aff.KEY || '').normalize();

    //     function pairs() {
    //         const p: string[] = [];
    //         const len = keys.length - 1;
    //         for (let i = 0; i < len; ++i) {
    //             const s = keys.slice(i, i + 2);
    //             if (s[0] !== '|' && s[1] !== '|') {
    //                 p.push(s + s.toUpperCase());
    //             }
    //         }
    //         return p;
    //     }

    //     return {
    //         map: pairs().join('|'),
    //         replace: keyboardCost,
    //     };
    // }

    const defs: SuggestionCostMapDef[] = [
        convToDef(),
        mapsToDef(),
        repsToDef(),
        tryToDef(),
        // keysToDef(),
        doubleLetters(),
        baseCostDef(),
    ];
    return defs;
}

// cspell:ignore conv OCONV

import type { Pattern, RegExpPatternDefinition } from '@cspell/cspell-types';

import { stringToRegExp } from '../util/textRegex.js';
import { isDefined } from '../util/util.js';
import { CalcLeftRightResultWeakCache } from './mergeCache.js';

type RegExpList = (string | RegExp)[];
type PatternDefinitions = RegExpPatternDefinition[];

const emptyRegExpList: RegExpList = [];
const emptyPatternDefinitions: PatternDefinitions = [];

const cache = new CalcLeftRightResultWeakCache<RegExpList, PatternDefinitions, RegExp[]>();

export function resolvePatterns(
    regExpList: (string | RegExp)[] = emptyRegExpList,
    patternDefinitions: RegExpPatternDefinition[] = emptyPatternDefinitions,
): RegExp[] {
    return cache.get(regExpList, patternDefinitions, _resolvePatterns);
}

function _resolvePatterns(regExpList: (string | RegExp)[], patternDefinitions: RegExpPatternDefinition[]): RegExp[] {
    const patternMap = new Map(patternDefinitions.map((def) => [def.name.toLowerCase(), def.pattern]));

    const resolved = new Set<string | RegExp>();

    function resolvePattern(p: Pattern) {
        if (resolved.has(p)) return undefined;
        resolved.add(p);
        return patternMap.get(p.toString().toLowerCase()) || p;
    }

    function* flatten(patterns: (Pattern | Pattern[])[]): IterableIterator<Pattern> {
        for (const pattern of patterns) {
            if (Array.isArray(pattern)) {
                yield* flatten(pattern.map(resolvePattern).filter(isDefined));
            } else {
                yield pattern;
            }
        }
    }
    const patternList = regExpList.map(resolvePattern).filter(isDefined);

    const result = [...flatten(patternList)].map(toRegExp).filter(isDefined);
    Object.freeze(regExpList);
    Object.freeze(patternDefinitions);
    Object.freeze(result);
    return result;
}

function toRegExp(pattern: RegExp | string): RegExp | undefined {
    return pattern instanceof RegExp ? new RegExp(pattern) : stringToRegExp(pattern, 'gim', 'g');
}

import type { Pattern, RegExpPatternDefinition } from '@cspell/cspell-types';
import { stringToRegExp } from '../util/textRegex';
import { isDefined } from '../util/util';

export function resolvePatterns(
    regExpList: (string | RegExp)[] = [],
    patternDefinitions: RegExpPatternDefinition[] = []
): RegExp[] {
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

    return [...flatten(patternList)].map(toRegExp).filter(isDefined);
}

function toRegExp(pattern: RegExp | string): RegExp | undefined {
    return pattern instanceof RegExp ? new RegExp(pattern) : stringToRegExp(pattern, 'gim', 'g');
}

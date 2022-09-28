import { pipe, opFlatten, opMap } from '@cspell/cspell-pipe/sync';
import { ParsedText, ParseResult, Scope, ScopeChain } from '@cspell/cspell-types/Parser';
import { compileGrammar } from '../..';
import { grammar } from '../../grammars/typescript';
import { appendMappedText } from '../../mappers/appendMappedText';
import { mapRawString } from '../../mappers/typescript';
import { createParser } from '../../parser/parser';
import { ScopePool } from '../../parser/scope';
import { TokenizedLine } from '../../parser/types';

const tsGrammar = compileGrammar(grammar);

const pool = new ScopePool();

const useScope = new WeakMap<ScopeChain, boolean>();

function* transform(texts: ParseResult['parsedTexts']): ParseResult['parsedTexts'] {
    for (const parsed of texts) {
        if (doesScopeMatch(parsed.scope, 'constant.character.escape.ts')) {
            const mapped = mapRawString(parsed.text);
            const scope = parsed.scope ? pool.parseScope(parsed.scope) : undefined;
            yield {
                text: mapped.text,
                scope: scope?.parent,
                map: mapped.map,
                range: parsed.range,
            };
            continue;
        }
        yield parsed;
    }
}

function* mergeStringResults(results: Iterable<ParsedText>): Iterable<ParsedText> {
    let last: ParsedText | undefined;
    for (const next of results) {
        if (!doesScopeMatch(next.scope, 'string.')) {
            if (last) {
                yield last;
                last = undefined;
            }
            yield next;
            continue;
        }
        if (!last) {
            last = next;
            continue;
        }
        if (next.scope !== last.scope || last.range[1] !== next.range[0]) {
            yield last;
            last = next;
            continue;
        }
        last = mergeParsedText(last, next);
    }
    if (last) yield last;
}

function mergeParsedText(a: ParsedText, b: ParsedText): ParsedText {
    const abT = appendMappedText(a, b);
    const ab: ParsedText = {
        text: abT.text,
        scope: a.scope,
        range: [a.range[0], b.range[1]],
        map: abT.map,
        delegate: a.delegate,
    };

    return ab;
}

function filterScope(scope: ScopeChain): boolean {
    const cached = useScope.get(scope);
    if (cached !== undefined) return cached;
    const value = scope.value;
    const use = !value.startsWith('punctuation') && !value.startsWith('keyword.');
    useScope.set(scope, use);
    return use;
}

function mapTokenizedLine(tl: TokenizedLine): ParseResult['parsedTexts'] {
    return tl.tokens
        .filter((t) => filterScope(t.scope))
        .map((t) => ({
            text: t.text,
            range: [tl.offset + t.range[0], tl.offset + t.range[1]] as const,
            scope: t.scope,
        }));
}

function mapTokenizedLines(itl: Iterable<TokenizedLine>): ParseResult['parsedTexts'] {
    return pipe(itl, opMap(mapTokenizedLine), opFlatten(), transform, mergeStringResults);
}

export const parser = createParser(tsGrammar, 'typescript', mapTokenizedLines);

function doesScopeMatch(s: Scope | undefined, match: string): boolean {
    if (!s) return false;
    return typeof s === 'string' ? s.startsWith(match) : s.value.startsWith(match);
}

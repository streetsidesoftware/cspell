import { grammar } from '../../grammars/typescript';
import { compileGrammar } from '../..';
import { createParser } from '../../parser/parser';
import { TokenizedLine } from '../../parser/types';
import { ParseResult, Scope } from '@cspell/cspell-types/Parser';
import { pipeSync as pipe } from '@cspell/cspell-pipe';
import { mapRawString } from '../../mappers/typescript';
import { ScopePool } from '../../parser/scope';

const tsGrammar = compileGrammar(grammar);

const pool = new ScopePool();

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

function mapTokenizedLine(tl: TokenizedLine): ParseResult['parsedTexts'] {
    return pipe(
        tl.tokens
            .filter((t) => !t.scope.value.startsWith('punctuation'))
            .map((t) => ({
                text: t.text,
                range: [tl.offset + t.range[0], tl.offset + t.range[1]] as const,
                scope: t.scope,
            })),
        transform
    );
}

export const parser = createParser(tsGrammar, 'typescript', mapTokenizedLine);

function doesScopeMatch(s: Scope | undefined, match: string): boolean {
    if (!s) return false;
    return typeof s === 'string' ? s.startsWith(match) : s.value.startsWith(match);
}

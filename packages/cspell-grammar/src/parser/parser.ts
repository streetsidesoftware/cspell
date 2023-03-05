import { opFilter, opFlatten, opMap, pipe } from '@cspell/cspell-pipe/sync';
import type { Parser, ParseResult } from '@cspell/cspell-types/Parser';

import type { Grammar } from './grammar.js';
import type { NGrammar } from './grammarNormalized.js';
import { tokenizeText, tokenizeTextIterable } from './tokenizeLine.js';
import type { TokenizedLine, TokenizedLineResult } from './types.js';

export interface DocumentParser {
    parse: (firstLine: string) => TokenizedLineResult;
}

export function parseDocument(
    grammar: NGrammar,
    _filename: string,
    content: string,
    emitter: (line: string) => void = (line) => console.log(line)
): void {
    const r = tokenizeText(content, grammar);
    const tokens = pipe(
        r,
        opMap((tl) => tl.tokens.map((t) => ({ t, l: tl.line }))),
        opFlatten(),
        opFilter((t) => !t.t.scope.value.startsWith('punctuation'))
    );

    for (const { t: token, l: line } of tokens) {
        emitter(
            `${(token.range[2] ?? line.lineNumber) + 1}:${token.range[0] + 1}\t ${JSON.stringify(
                token.text
            )}\t ${token.scope.toString()}`
        );
    }
}

function mapTokenizedLine(tl: TokenizedLine): ParseResult['parsedTexts'] {
    return tl.tokens.map((t) => ({
        text: t.text,
        range: [tl.offset + t.range[0], tl.offset + t.range[1]] as const,
        scope: t.scope,
    }));
}

function mapTokenizedLines(itl: Iterable<TokenizedLine>): ParseResult['parsedTexts'] {
    return pipe(itl, opMap(mapTokenizedLine), opFlatten());
}

export function createParser(grammar: Grammar, name: string, transform = mapTokenizedLines): Parser {
    function parse(content: string, filename: string): ParseResult {
        const parsedTexts: ParseResult['parsedTexts'] = pipe(tokenizeTextIterable(content, grammar), transform);
        return { content, filename, parsedTexts };
    }

    return { name, parse };
}

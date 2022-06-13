import { NGrammar } from './grammarNormalized';
import { tokenizeText, tokenizeTextIterable } from './tokenizeLine';
import type { TokenizedLine, TokenizedLineResult } from './types';
import { pipeSync as pipe, opFlatten, opMap, opFilter } from '@cspell/cspell-pipe';
import type { Parser, ParseResult } from '@cspell/cspell-types/Parser';
import { Grammar } from './grammar';

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

export function createParser(grammar: Grammar, name: string, transform = mapTokenizedLine): Parser {
    function parse(content: string, filename: string): ParseResult {
        const parsedTexts: ParseResult['parsedTexts'] = pipe(
            tokenizeTextIterable(content, grammar),
            opMap(transform),
            opFlatten()
        );
        return { content, filename, parsedTexts };
    }

    return { name, parse };
}

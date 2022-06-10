import { NGrammar } from './grammarNormalized';
import { tokenizeText } from './tokenizeLine';
import type { TokenizedLineResult } from './types';
import { pipeSync as pipe, opFlatten, opMap, opFilter } from '@cspell/cspell-pipe';

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
            `${line.lineNumber + 1}:${token.offset + 1}\t ${JSON.stringify(token.text)}\t ${token.scope.toString()}`
        );
    }
}

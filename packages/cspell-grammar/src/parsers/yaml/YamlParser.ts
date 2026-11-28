import type { ParsedText, Parser, SourceMap } from '@cspell/cspell-types/Parser';
import { CST, Lexer } from 'yaml';

export const parser: Parser = {
    name: 'yaml',
    parse(content, filename) {
        return { content, filename, parsedTexts: parseLines(content) };
    },
};

function* escapedApostropheOffsets(content: string): Generator<number, void> {
    if (!content.includes("''")) return;

    let offset = 0;
    let scalar = false;
    for (const token of new Lexer().lex(content)) {
        // The lexer inserts control tokens that do not occupy a position in the source.
        // The payload following SCALAR is source text, even if it looks like a control token.
        if (!scalar) {
            if (token === CST.SCALAR) {
                scalar = true;
                continue;
            }
            if (token === CST.DOCUMENT || token === CST.FLOW_END) continue;
            if (CST.tokenType(token) === 'single-quoted-scalar' && token.endsWith("'")) {
                // Skip the opening and closing quotes.
                for (
                    let i = token.indexOf("''", 1);
                    i >= 0 && i + 1 < token.length - 1;
                    i = token.indexOf("''", i + 2)
                ) {
                    yield offset + i;
                }
            }
        }
        offset += token.length;
        scalar = false;
    }
}

function* parseLines(content: string): Iterable<ParsedText> {
    const offsets = escapedApostropheOffsets(content);
    let next = offsets.next().value;
    for (const { 0: line, index: start } of content.matchAll(/[^\r\n]+(?:\r\n?|\n)?|\r\n?|\n/g)) {
        const end = start + line.length;
        const range = [start, end] as const;
        if (next === undefined || next >= end) {
            yield { text: line, range };
            continue;
        }

        const map: SourceMap = [];
        const pieces: string[] = [];
        let pos = start;
        while (next !== undefined && next < end) {
            const unchanged = next - pos;
            pieces.push(content.slice(pos, next + 1));
            map.push(unchanged, unchanged, 2, 1);
            pos = next + 2;
            next = offsets.next().value;
        }
        pieces.push(content.slice(pos, end));
        yield { text: pieces.join(''), range, map };
    }
}

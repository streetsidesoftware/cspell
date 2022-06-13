import { grammar } from '../../grammars/typescript';
import { compileGrammar } from '../..';
import { createParser } from '../../parser/parser';
import { TokenizedLine } from '../../parser/types';
import { ParseResult } from '@cspell/cspell-types/Parser';

const tsGrammar = compileGrammar(grammar);

function mapTokenizedLine(tl: TokenizedLine): ParseResult['parsedTexts'] {
    return tl.tokens
        .map((t) => ({
            text: t.text,
            range: [tl.offset + t.range[0], tl.offset + t.range[1]] as const,
            scope: t.scope,
        }))
        .filter((t) => !t.scope.value.startsWith('punctuation'));
}

export const parser = createParser(tsGrammar, 'typescript', mapTokenizedLine);

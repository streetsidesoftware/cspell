import type { GrammarDef } from './grammarDefinition';
import type { NGrammar } from './grammarNormalized';
import { normalizeGrammar } from './grammarNormalizer';

export type Grammar = NGrammar;

export function compileGrammar(grammar: GrammarDef): Grammar {
    return normalizeGrammar(grammar);
}

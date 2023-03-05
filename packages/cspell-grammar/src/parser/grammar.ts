import type { GrammarDef } from './grammarDefinition.js';
import type { NGrammar } from './grammarNormalized.js';
import { normalizeGrammar } from './grammarNormalizer.js';

export type Grammar = NGrammar;

export function compileGrammar(grammar: GrammarDef): Grammar {
    return normalizeGrammar(grammar);
}

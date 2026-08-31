import type { MappedText, SubstitutionDefinition, SubstitutionDefinitions, Substitutions } from '@cspell/cspell-types';
import type { GTrieNode } from 'cspell-trie-lib';
import { GTrie } from 'cspell-trie-lib';

import { mergeSourceMaps } from './SourceMap.js';
import { applyEditsToText } from './TextMapEdit.js';
import type { Edit, TextTransformer } from './Transformer.js';
import { toMappedText } from './Transformer.js';

type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;

export interface SubstitutionInfo {
    substitutions?: Substitutions | undefined;
    substitutionDefinitions?: SubstitutionDefinitions | undefined;
}

export type ReadonlySubstitutionInfo = DeepReadonly<SubstitutionInfo>;

type SubTrie = GTrie<string, string>;

export class SubstitutionTransformer implements TextTransformer {
    #trie: SubTrie | undefined;

    constructor(subMap: Map<string, string> | undefined) {
        this.#trie = subMap ? GTrie.fromEntries(subMap) : undefined;
    }

    transform(text: string | MappedText): MappedText {
        if (typeof text === 'string') {
            return this.transformString(text);
        }

        if (!this.#trie) return text;

        const transformed = this.transformString(text.text);
        const rawText = text.rawText ?? text.text;

        const result: MappedText = {
            ...text,
            text: transformed.text,
            map: mergeSourceMaps(text.map, transformed.map),
            rawText,
        };

        return result;
    }

    *transformAll(src: Iterable<string | MappedText>): Iterable<MappedText> {
        for (const item of src) {
            yield this.transform(item);
        }
    }

    transformString(text: string): MappedText {
        if (!this.#trie) {
            return toMappedText(text);
        }
        return applyEditsToText(text, calcEdits(text, this.#trie));
    }
}

function* calcEdits(text: string, subTrie: SubTrie): Iterable<Edit> {
    let i = 0;
    while (i < text.length) {
        const edit = findSubString(text, subTrie, i);
        if (edit) {
            yield edit;
            i = edit.range[1];
            continue;
        }
        ++i;
    }
}

function findSubString(text: string, subTrie: SubTrie, start: number): Edit | undefined {
    let node: GTrieNode<string, string> | undefined = subTrie.root;
    let i = start;
    let lastMatch: Edit | undefined = undefined;

    node = node.children?.get(text[i]);

    while (i < text.length && node) {
        ++i;
        if (node.value !== undefined) {
            lastMatch = { text: node.value, range: [start, i] };
        }
        node = node.children?.get(text[i]);
    }

    return lastMatch;
}

function calcSubMap(
    subs: DeepReadonly<Substitutions>,
    defs: DeepReadonly<SubstitutionDefinitions>,
): { subMap: Map<string, string>; missing: string[] } {
    const subMap = new Map<string, string>();
    const missing: string[] = [];
    const defMap = buildDefinitionMap(defs);

    for (const sub of subs) {
        if (typeof sub === 'string') {
            const def = defMap.get(sub);
            if (!def) {
                missing.push(sub);
                continue;
            }
            for (const [find, replacement] of def.entries) {
                subMap.set(find, replacement);
            }
            continue;
        }
        subMap.set(sub[0], sub[1]);
    }

    return { subMap, missing };
}

function buildDefinitionMap(
    defs: DeepReadonly<SubstitutionDefinitions>,
): Map<string, DeepReadonly<SubstitutionDefinition>> {
    const defMap = new Map<string, DeepReadonly<SubstitutionDefinition>>();

    for (const def of defs) {
        defMap.set(def.name, def);
    }

    return defMap;
}

export interface CreateSubstitutionTransformerResult {
    transformer: SubstitutionTransformer;
    /**
     * The list of substitutions that were requested but not found in the definitions.
     * This is used to report errors to the user about missing substitutions.
     */
    missing: string[] | undefined;
}

/**
 * Creates a SubstitutionTransformer based upon the provided SubstitutionInfo.
 * This will create a transformer that can be used to apply the substitutions to a document before spell checking.
 * @param info
 * @returns
 */
export function createSubstitutionTransformer(info: ReadonlySubstitutionInfo): CreateSubstitutionTransformerResult {
    const { subMap, missing } =
        info.substitutions && info.substitutionDefinitions
            ? calcSubMap(info.substitutions, info.substitutionDefinitions)
            : {};
    return {
        transformer: new SubstitutionTransformer(subMap),
        missing: missing && missing.length > 0 ? missing : undefined,
    };
}

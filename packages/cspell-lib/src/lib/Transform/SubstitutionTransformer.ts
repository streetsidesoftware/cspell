import type { MappedText, SubstitutionDefinition, SubstitutionDefinitions, Substitutions } from '@cspell/cspell-types';
import type { Range, SourceMap } from '@cspell/cspell-types/Parser';
import type { GTrieNode } from 'cspell-trie-lib';
import { GTrie } from 'cspell-trie-lib';

type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;

export interface SubstitutionInfo {
    substitutions?: Substitutions | undefined;
    substitutionDefinitions?: SubstitutionDefinitions | undefined;
}

export type ReadonlySubstitutionInfo = DeepReadonly<SubstitutionInfo>;

type SubTrie = GTrie<string, string>;

export class SubstitutionTransformer {
    #trie: SubTrie | undefined;

    constructor(subMap: Map<string, string> | undefined) {
        this.#trie = subMap ? GTrie.fromEntries(subMap) : undefined;
    }

    transform(text: string): MappedText {
        if (!this.#trie) {
            return { text, range: [0, text.length] };
        }

        const map: SourceMap = [0, 0];
        let repText = '';
        let lastEnd = 0;

        for (const edit of calcEdits(text, this.#trie)) {
            if (edit.range[0] > lastEnd) {
                repText += text.slice(lastEnd, edit.range[0]);
                map.push(edit.range[0], repText.length);
            }
            repText += edit.text;
            map.push(edit.range[1], repText.length);
            lastEnd = edit.range[1];
        }

        if (lastEnd === 0) {
            return { text, range: [0, text.length] };
        }

        if (lastEnd < text.length) {
            repText += text.slice(lastEnd);
            map.push(text.length, repText.length);
        }

        const result: MappedText = {
            text: repText,
            range: [0, text.length],
            map,
        };

        return result;
    }
}

interface Edit {
    /**
     * The replacement text for the edit. This is the text that will replace the original text in the string.
     */
    text: string;
    /**
     * The range of the text to be replaced. This is a tuple of the form `[start, end]`,
     * where start is the index of the first character to be replaced,
     * and end is the index of the first character after the last character to be replaced.
     */
    range: Range;
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

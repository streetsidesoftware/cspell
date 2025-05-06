import assert from 'node:assert';

import type { CSpellSettings } from '@cspell/cspell-types';
import {
    type Document as YamlDocument,
    isMap,
    isScalar,
    isSeq,
    parseDocument,
    Scalar,
    stringify,
    YAMLMap,
    YAMLSeq,
} from 'yaml';

import { CSpellConfigFile } from '../CSpellConfigFile.js';
import { detectIndentAsNum } from '../serializers/util.js';
import type { TextFile } from '../TextFile.js';
import { ParseError } from './Errors.js';

export class CSpellConfigFileYaml extends CSpellConfigFile {
    #settings: CSpellSettings;

    constructor(
        readonly url: URL,
        readonly yamlDoc: YamlDocument,
        readonly indent: number,
    ) {
        super(url);
        this.#settings = yamlDoc.toJS();
    }

    get settings(): CSpellSettings {
        return this.#settings;
    }

    addWords(wordsToAdd: string[]): this {
        const cfgWords: YAMLSeq<StringOrScalar> =
            (this.yamlDoc.get('words') as YAMLSeq<StringOrScalar>) || new YAMLSeq<StringOrScalar>();
        assert(isSeq(cfgWords), 'Expected words to be a YAML sequence');
        const knownWords = new Set(cfgWords.items.map((item) => getScalarValue(item)));
        wordsToAdd.forEach((w) => {
            if (knownWords.has(w)) return;
            cfgWords.add(w);
            knownWords.add(w);
        });
        const sorted = sortWords(cfgWords.items);
        sorted.forEach((item, index) => cfgWords.set(index, item));
        cfgWords.items.length = sorted.length;
        this.yamlDoc.set('words', cfgWords);
        this.#settings = this.yamlDoc.toJS();
        return this;
    }

    serialize() {
        return stringify(this.yamlDoc, { indent: this.indent });
    }
}

export function parseCSpellConfigFileYaml(file: TextFile): CSpellConfigFileYaml {
    const { url, content } = file;

    try {
        const doc = parseDocument<YAMLMap | Scalar<null | string>>(content);
        // Force empty content to be a map.
        if (doc.contents === null || (isScalar(doc.contents) && !doc.contents.value)) {
            doc.contents = new YAMLMap();
        }
        if (!isMap(doc.contents)) {
            throw new ParseError(url, `Invalid YAML content ${url}`);
        }
        const indent = detectIndentAsNum(content);
        return new CSpellConfigFileYaml(url, doc, indent);
    } catch (e) {
        if (e instanceof ParseError) {
            throw e;
        }
        throw new ParseError(url, undefined, { cause: e });
    }
}

function getScalarValue<T>(node: T | Scalar<T>): T {
    if (isScalar(node)) {
        return node.value;
    }
    return node;
}

function toScalar<T>(node: T | Scalar<T>): Scalar<T> {
    if (isScalar(node)) {
        return node;
    }
    return new Scalar(node);
}

type StringOrScalar = string | Scalar<string>;

function groupWords(words: StringOrScalar[]): StringOrScalar[][] {
    const groups: StringOrScalar[][] = [];
    if (words.length === 0) {
        return groups;
    }
    let currentGroup: StringOrScalar[] = [];
    groups.push(currentGroup);
    for (const word of words) {
        if (isSectionHeader(word)) {
            currentGroup = [];
            groups.push(currentGroup);
        }
        currentGroup.push(cloneWord(word));
    }
    return groups;
}

function isSectionHeader(word: StringOrScalar): boolean {
    if (!isScalar(word) || (!word.commentBefore && !word.spaceBefore)) return false;
    if (word.spaceBefore) return true;
    if (!word.commentBefore) return false;
    return word.commentBefore.includes('\n\n');
}

function adjustSectionHeader(word: Scalar<string>, prev: StringOrScalar, isFirstSection: boolean): void {
    // console.log('adjustSectionHeader %o', { word, prev, isFirstSection });
    if (!isScalar(prev)) return;
    let captureComment = isFirstSection;
    if (prev.spaceBefore) {
        word.spaceBefore = true;
        captureComment = true;
        delete prev.spaceBefore;
    }
    if (!prev.commentBefore) return;

    const originalComment = prev.commentBefore;
    const lines = originalComment.split(/^\n/gm);
    const lastLine = lines[lines.length - 1];
    // console.log('adjustSectionHeader lines %o', { lines, isFirstSection, lastLine, originalComment });
    captureComment = (captureComment && originalComment.trim() === lastLine.trim()) || originalComment.endsWith('\n');
    let header = originalComment;
    if (captureComment) {
        delete prev.commentBefore;
    } else {
        prev.commentBefore = lastLine;
        lines.pop();
        header = lines.join('\n');
    }
    if (word.commentBefore) {
        header += header.endsWith('\n\n') ? '' : '\n';
        header += header.endsWith('\n\n') ? '' : '\n';
        header += word.commentBefore;
    }
    word.commentBefore = header;
    // console.log('adjustSectionHeader after %o', { word, prev, isFirstSection, originalComment, lastLine, lines });
}

function sortWords(words: StringOrScalar[]): StringOrScalar[] {
    const compare = new Intl.Collator().compare;

    const groups = groupWords(words);
    let firstGroup = true;
    for (const group of groups) {
        const head = group[0];
        group.sort((a, b) => {
            return compare(getScalarValue(a), getScalarValue(b));
        });
        if (group[0] !== head && isScalar(head)) {
            const first = (group[0] = toScalar(group[0]));
            adjustSectionHeader(first, head, firstGroup);
        }
        firstGroup = false;
    }

    const result = groups.flat();
    return result.map((w) => toScalar(w));
}

function cloneWord(word: StringOrScalar): StringOrScalar {
    if (isScalar(word)) {
        return word.clone() as Scalar<string>;
    }
    return word;
}

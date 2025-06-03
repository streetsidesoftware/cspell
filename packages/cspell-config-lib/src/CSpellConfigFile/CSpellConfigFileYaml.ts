import assert from 'node:assert';

import type { CSpellSettings } from '@cspell/cspell-types';
import {
    type Document as YamlDocument,
    isAlias,
    isMap,
    isPair,
    isScalar,
    isSeq,
    type Node as YamlNode,
    type Pair,
    parseDocument,
    Scalar,
    stringify,
    visit as yamlWalkAst,
    YAMLMap,
    YAMLSeq,
} from 'yaml';

import { MutableCSpellConfigFile } from '../CSpellConfigFile.js';
import { detectIndentAsNum } from '../serializers/util.js';
import type { TextFile } from '../TextFile.js';
import type { KeyOf, ValueOf1 } from '../types.js';
import type {
    CfgArrayNode,
    CfgObjectNode,
    CfgScalarNode,
    NodeComments,
    NodeOrValue,
    NodeValue,
    RCfgNode,
} from '../UpdateConfig/CfgTree.js';
import { isNodeValue } from '../UpdateConfig/CfgTree.js';
import { ParseError } from './Errors.js';

type S = CSpellSettings;

export class CSpellConfigFileYaml extends MutableCSpellConfigFile {
    #settings: CSpellSettings | undefined = undefined;

    constructor(
        readonly url: URL,
        readonly yamlDoc: YamlDocument,
        readonly indent: number,
    ) {
        super(url);
        // Set the initial settings from the YAML document.
        this.#settings = this.yamlDoc.toJS() as CSpellSettings;
    }

    get settings(): CSpellSettings {
        return this.#settings ?? (this.yamlDoc.toJS() as CSpellSettings);
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
        this.#markAsMutable();
        return this;
    }

    serialize() {
        return stringify(this.yamlDoc, { indent: this.indent });
    }

    setValue<K extends keyof S>(key: K, value: NodeOrValue<ValueOf1<S, K>>): this {
        if (isNodeValue(value)) {
            let node = this.#getNode(key);
            if (!node) {
                node = this.yamlDoc.createNode(value.value);
                setYamlNodeComments(node, value);
                this.yamlDoc.set(key, node);
            } else {
                setYamlNodeValue(node, value);
            }
        } else {
            this.yamlDoc.set(key, value);
        }
        this.#markAsMutable();
        return this;
    }

    getValue<K extends keyof S>(key: K): ValueOf1<S, K> {
        const node = this.#getNode(key);
        return node?.toJS(this.yamlDoc);
    }

    #getNode(key: unknown | unknown[]): YamlNode | undefined {
        return getYamlNode(this.yamlDoc, key);
    }

    getNode<K extends keyof S>(key: K): RCfgNode<ValueOf1<S, K>> | undefined;
    getNode<K extends keyof S>(
        key: K,
        defaultValue: Exclude<ValueOf1<S, K>, undefined>,
    ): Exclude<RCfgNode<ValueOf1<S, K>>, undefined>;
    getNode<K extends keyof S>(key: K, defaultValue: ValueOf1<S, K> | undefined): RCfgNode<ValueOf1<S, K>> | undefined;
    getNode<K extends keyof S>(
        key: K,
        defaultValue?: ValueOf1<CSpellSettings, K>,
    ): RCfgNode<ValueOf1<CSpellSettings, K>> | undefined {
        let yNode = this.#getNode(key);
        if (!yNode) {
            if (defaultValue === undefined) {
                return undefined;
            }
            yNode = this.yamlDoc.createNode(defaultValue);
            this.yamlDoc.set(key, yNode);
        }
        this.#markAsMutable();
        return toConfigNode(this.yamlDoc, yNode) as RCfgNode<ValueOf1<CSpellSettings, K>>;
    }

    getFieldNode<K extends keyof S>(key: K): RCfgNode<string> | undefined {
        const contents = this.yamlDoc.contents;
        if (!isMap(contents)) {
            return undefined;
        }

        const pair = findPair(contents, key as string);
        if (!pair) {
            return undefined;
        }
        return toConfigNode(this.yamlDoc, pair.key) as RCfgNode<string>;
    }

    /**
     * Removes a value from the document.
     * @returns `true` if the item was found and removed.
     */
    delete(key: keyof S): boolean {
        const removed = this.yamlDoc.delete(key);
        if (removed) {
            this.#markAsMutable();
        }
        return removed;
    }

    get comment(): string | undefined {
        return this.yamlDoc.comment ?? undefined;
    }

    set comment(comment: string | undefined) {
        // eslint-disable-next-line unicorn/no-null
        this.yamlDoc.comment = comment ?? null;
    }

    setSchema(schemaRef: string): this {
        let commentBefore = this.yamlDoc.commentBefore || '';
        commentBefore = commentBefore.replace(/^ yaml-language-server: \$schema=.*\n?/m, '');
        commentBefore = ` yaml-language-server: $schema=${schemaRef}` + (commentBefore ? '\n' + commentBefore : '');
        this.yamlDoc.commentBefore = commentBefore;
        if (this.getNode('$schema')) {
            this.setValue('$schema', schemaRef);
        }
        return this;
    }

    removeAllComments(): this {
        const doc = this.yamlDoc;
        // eslint-disable-next-line unicorn/no-null
        doc.comment = null;
        // eslint-disable-next-line unicorn/no-null
        doc.commentBefore = null;
        yamlWalkAst(this.yamlDoc, (_, node) => {
            if (!(isScalar(node) || isMap(node) || isSeq(node))) return;
            // eslint-disable-next-line unicorn/no-null
            node.comment = null;
            // eslint-disable-next-line unicorn/no-null
            node.commentBefore = null;
        });
        return this;
    }

    setComment(key: keyof CSpellSettings, comment: string, inline?: boolean): this {
        const node = this.getFieldNode(key);
        if (!node) return this;

        if (inline) {
            node.comment = comment;
        } else {
            node.commentBefore = comment;
        }

        return this;
    }

    /**
     * Marks the config file as mutable. Any access to settings will the settings to be regenerated
     * from the YAML document.
     */
    #markAsMutable() {
        this.#settings = undefined;
    }

    static parse(file: TextFile): CSpellConfigFileYaml {
        return parseCSpellConfigFileYaml(file);
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

function getYamlNode(yamlDoc: YamlDocument | YAMLMap | YAMLSeq, key: unknown | unknown[]): YamlNode | undefined {
    return (Array.isArray(key) ? yamlDoc.getIn(key, true) : yamlDoc.get(key, true)) as YamlNode | undefined;
}

type ArrayType<T> = T extends unknown[] ? T[number] : never;

function toConfigNode<T>(doc: YamlDocument, yNode: YamlNode): RCfgNode<T> {
    if (isYamlSeq(yNode)) {
        return toConfigArrayNode(doc, yNode) as RCfgNode<T>;
    }
    if (isMap(yNode)) {
        return toConfigObjectNode(doc, yNode) as RCfgNode<T>;
    }
    if (isScalar(yNode)) {
        return toConfigScalarNode(doc, yNode) as RCfgNode<T>;
    }
    throw new Error(`Unsupported YAML node type: ${yamlNodeType(yNode)}`);
}

abstract class ConfigNodeBase<N extends 'array' | 'object' | 'scalar', T> {
    constructor(readonly type: N) {}

    abstract value: T;
    abstract comment: string | undefined;
    abstract commentBefore: string | undefined;
}

class ConfigArrayNode<T extends unknown[]>
    extends ConfigNodeBase<'array', ArrayType<T>[]>
    implements CfgArrayNode<ArrayType<T>>
{
    #doc: YamlDocument;
    #yNode: YAMLSeq<ArrayType<T>>;

    constructor(doc: YamlDocument, yNode: YAMLSeq<ArrayType<T>>) {
        super('array');
        this.#doc = doc;
        this.#yNode = yNode;
    }

    get value(): ArrayType<T>[] {
        return this.#yNode.toJS(this.#doc) as ArrayType<T>[];
    }
    get comment() {
        return this.#yNode.comment ?? undefined;
    }
    set comment(comment: string | undefined) {
        // eslint-disable-next-line unicorn/no-null
        this.#yNode.comment = comment ?? null;
    }
    get commentBefore() {
        return this.#yNode.commentBefore ?? undefined;
    }
    set commentBefore(comment: string | undefined) {
        // eslint-disable-next-line unicorn/no-null
        this.#yNode.commentBefore = comment ?? null;
    }

    getNode(key: number) {
        const node = getYamlNode(this.#yNode, key);
        if (!node) return undefined;
        return toConfigNode<ArrayType<T>>(this.#doc, node) as RCfgNode<ArrayType<T>>;
    }

    getValue(key: number): ArrayType<T> | undefined {
        const node = getYamlNode(this.#yNode, key);
        if (!node) return undefined;
        return node.toJS(this.#doc) as ArrayType<T>;
    }

    setValue(key: number, value: NodeOrValue<ArrayType<T>>): void {
        if (!isNodeValue(value)) {
            this.#yNode.set(key, value);
            return;
        }
        this.#yNode.set(key, value.value);
        const yNodeValue = getYamlNode(this.#yNode, key);
        assert(yNodeValue);
        // eslint-disable-next-line unicorn/no-null
        yNodeValue.comment = value.comment ?? null;
        // eslint-disable-next-line unicorn/no-null
        yNodeValue.commentBefore = value.commentBefore ?? null;
    }

    delete(key: number): boolean {
        return this.#yNode.delete(key);
    }

    push(value: NodeOrValue<ArrayType<T>>): number {
        if (!isNodeValue(value)) {
            this.#yNode.add(value);
            return this.#yNode.items.length;
        }
        this.#yNode.add(value.value);

        setYamlNodeComments(getYamlNode(this.#yNode, this.#yNode.items.length - 1), value);
        return this.#yNode.items.length;
    }

    get length(): number {
        return this.#yNode.items.length;
    }
}

function toConfigArrayNode<T extends unknown[]>(doc: YamlDocument, yNode: YAMLSeq): CfgArrayNode<ArrayType<T>> {
    return new ConfigArrayNode<T>(doc, yNode as YAMLSeq<ArrayType<T>>);
}

class ConfigObjectNode<T extends object> extends ConfigNodeBase<'object', T> implements CfgObjectNode<T> {
    #doc: YamlDocument;
    #yNode: YAMLMap<KeyOf<T>, T[KeyOf<T>]>;

    constructor(doc: YamlDocument, yNode: YAMLMap<KeyOf<T>, T[KeyOf<T>]>) {
        super('object');
        this.#doc = doc;
        this.#yNode = yNode;
    }

    get value(): T {
        return this.#yNode.toJS(this.#doc) as T;
    }
    get comment() {
        return this.#yNode.comment ?? undefined;
    }
    set comment(comment: string | undefined) {
        // eslint-disable-next-line unicorn/no-null
        this.#yNode.comment = comment ?? null;
    }
    get commentBefore() {
        return this.#yNode.commentBefore ?? undefined;
    }
    set commentBefore(comment: string | undefined) {
        // eslint-disable-next-line unicorn/no-null
        this.#yNode.commentBefore = comment ?? null;
    }

    getValue<K extends keyof T>(key: K): T[K] | undefined {
        const node = getYamlNode(this.#yNode, key);
        if (!node) return undefined;
        return node.toJS(this.#doc) as T[K];
    }
    getNode<K extends keyof T>(key: K): RCfgNode<T[K]> | undefined {
        const node = getYamlNode(this.#yNode, key);
        if (!node) return undefined;
        return toConfigNode<T[K]>(this.#doc, node);
    }
    setValue<K extends KeyOf<T>>(key: K, value: NodeOrValue<ValueOf1<T, K>>): void {
        if (!isNodeValue(value)) {
            this.#yNode.set(key, value);
            return;
        }
        this.#yNode.set(key, value.value);
        const yNodeValue = getYamlNode(this.#yNode, key);
        assert(yNodeValue);
        // eslint-disable-next-line unicorn/no-null
        yNodeValue.comment = value.comment ?? null;
        // eslint-disable-next-line unicorn/no-null
        yNodeValue.commentBefore = value.commentBefore ?? null;
    }
    delete<K extends KeyOf<T>>(key: K): boolean {
        return this.#yNode.delete(key);
    }
}

function toConfigObjectNode<T extends object>(doc: YamlDocument, yNode: YAMLMap): CfgObjectNode<T> {
    return new ConfigObjectNode<T>(doc, yNode as YAMLMap<KeyOf<T>, T[KeyOf<T>]>);
}

class ConfigScalarNode<T extends string | number | boolean | null | undefined>
    extends ConfigNodeBase<'scalar', T>
    implements CfgScalarNode<T>
{
    private $doc: YamlDocument;
    private $yNode: Scalar<T>;

    readonly type = 'scalar';

    constructor(doc: YamlDocument, yNode: Scalar<T>) {
        super('scalar');
        this.$doc = doc;
        this.$yNode = yNode;
        assert(isScalar(yNode), 'Expected yNode to be a Scalar');
    }

    get value() {
        return this.$yNode.toJS(this.$doc) as T;
    }

    set value(value: T) {
        this.$yNode.value = value;
    }

    get comment() {
        return this.$yNode.comment ?? undefined;
    }

    set comment(comment: string | undefined) {
        // eslint-disable-next-line unicorn/no-null
        this.$yNode.comment = comment ?? null;
    }

    get commentBefore() {
        return this.$yNode.commentBefore ?? undefined;
    }

    set commentBefore(comment: string | undefined) {
        // eslint-disable-next-line unicorn/no-null
        this.$yNode.commentBefore = comment ?? null;
    }

    toJSON() {
        return {
            type: this.type,
            value: this.value,
            comment: this.comment,
            commentBefore: this.commentBefore,
        };
    }
}

function toConfigScalarNode<T extends string | number | boolean | null | undefined>(
    doc: YamlDocument,
    yNode: Scalar,
): CfgScalarNode<T> {
    return new ConfigScalarNode<T>(doc, yNode as Scalar<T>);
}

function isYamlSeq<T>(node: YamlNode): node is YAMLSeq<T> {
    return isSeq(node);
}

function yamlNodeType(node: YamlNode): 'scalar' | 'seq' | 'map' | 'alias' | 'unknown' {
    if (isScalar(node)) return 'scalar';
    if (isSeq(node)) return 'seq';
    if (isMap(node)) return 'map';
    if (isAlias(node)) return 'alias';
    return 'unknown';
}

function setYamlNodeComments(yamlNode: YamlNode | undefined, comments: NodeComments): void {
    if (!yamlNode) return;
    if ('comment' in comments) {
        // eslint-disable-next-line unicorn/no-null
        yamlNode.comment = comments.comment ?? null;
    }
    if ('commentBefore' in comments) {
        // eslint-disable-next-line unicorn/no-null
        yamlNode.commentBefore = comments.commentBefore ?? null;
    }
}

function setYamlNodeValue<T>(yamlNode: YamlNode, nodeValue: NodeValue<T>): void {
    setYamlNodeComments(yamlNode, nodeValue);
    if (isScalar(yamlNode)) {
        yamlNode.value = nodeValue.value;
        return;
    }
    const value = nodeValue.value;
    if (isSeq(yamlNode)) {
        assert(Array.isArray(value), 'Expected value to be an array for YAMLSeq');
        yamlNode.items = [];
        for (let i = 0; i < value.length; ++i) {
            yamlNode.set(i, value[i]);
        }
        return;
    }
    if (isMap(yamlNode)) {
        assert(typeof value === 'object' && value !== null, 'Expected value to be an object for YAMLMap');
        yamlNode.items = [];
        for (const [key, val] of Object.entries(value)) {
            yamlNode.set(key, val);
        }
        return;
    }
    throw new Error(`Unsupported YAML node type: ${yamlNodeType(yamlNode)}`);
}

function findPair(yNode: YamlNode, key: string): Pair<Scalar<string>, YamlNode> | undefined {
    if (!isMap(yNode)) return undefined;
    const items = yNode.items as Pair<YamlNode, YamlNode>[];
    for (const item of items) {
        if (!isPair(item)) continue;
        if (isScalar(item.key) && item.key.value === key) {
            return item as Pair<Scalar<string>, YamlNode>;
        }
    }
    return undefined;
}

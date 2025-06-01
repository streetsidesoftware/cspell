import { KeyOf, ValueOf1 as ValueOf } from '../types.js';

const nodeValueSymbol = Symbol.for('cspell.config.nodeValue');

export interface NodeValue<T> {
    readonly [nodeValueSymbol]?: true;
    readonly value: T;
    readonly comment: string | undefined;
    readonly commentBefore: string | undefined;
}

export type NodeOrValue<T> = T | NodeValue<T>;

export interface CfgNodeBase<T> {
    readonly type: 'scalar' | 'array' | 'object';
    readonly value: T;
    getValue?: (<K extends KeyOf<T>>(key: K) => ValueOf<T, K> | undefined) | undefined;
    getNode?: (<K extends KeyOf<T>>(key: K) => RCfgNode<ValueOf<T, K>> | undefined) | undefined;
    setValue?: (<K extends KeyOf<T>>(key: K, value: NodeOrValue<ValueOf<T, K>>) => void) | undefined;
    // sort?: ((comp: <N extends ValueOf1<T, KeyOf<T>>>(a: N, b: N) => number) => void) | undefined;
    // getItems?: (() => Iterable<[KeyOf<T>, CfgNode<ValueOf1<T, KeyOf<T>>>]> | undefined) | undefined;
    readonly length?: number | undefined;

    comment?: string | undefined;
    commentBefore?: string | undefined;
}

export interface CfgScalarNode<T extends string | number | boolean | null | undefined> extends CfgNodeBase<T> {
    readonly type: 'scalar';
    readonly value: T;
    setValue?: undefined;
    getValue?: undefined;
    getNode?: undefined;
    setNode?: undefined;
    sort?: undefined;
    getItems?: undefined;
    length?: undefined;
}

export interface CfgArrayNode<T> extends CfgNodeBase<{ [key: number]: T }> {
    readonly type: 'array';
    getValue: (key: number) => T | undefined;
    getNode: (key: number) => RCfgNode<T> | undefined;
    setValue: (key: number, value: NodeOrValue<T>) => void;
    // sort: (comp: (a: T, b: T) => number) => void;
    // getItems: () => Iterable<[number, CfgNode<T>]> | undefined;
    // push:
    readonly length: number;
}

export interface CfgObjectNode<T extends object> {
    readonly type: 'object';
    getValue: <K extends KeyOf<T>>(key: K) => ValueOf<T, K> | undefined;
    getNode: <K extends KeyOf<T>>(key: K) => RCfgNode<ValueOf<T, K>> | undefined;
    setValue: <K extends KeyOf<T>>(key: K, value: NodeOrValue<ValueOf<T, K>>) => void;
    // sort?: undefined;
    // getItems: () => Iterable<[KeyOf<T>, CfgNode<ValueOf1<T, KeyOf<T>>>]> | undefined;
    readonly length?: undefined;
}

export type RCfgNode<T> = T extends undefined ? undefined : CfgNode<T>;

export type CfgNode<T> = T extends unknown[]
    ? CfgArrayNode<T[number]>
    : T extends object
      ? CfgObjectNode<T>
      : T extends string | number | boolean | undefined
        ? CfgScalarNode<T>
        : CfgNodeBase<T>;

export function isNodeValue<T>(value: unknown): value is NodeValue<T> {
    if (!(typeof value === 'object' && value !== null)) return false;
    if (nodeValueSymbol in value) return true;
    return 'value' in value && 'comment' in value && 'commentBefore' in value && Object.keys(value).length === 3;
}

export function nodeValue<T>(value: T, comment?: string, commentBefore?: string): NodeValue<T> {
    return {
        value,
        comment: comment ?? undefined,
        commentBefore: commentBefore ?? undefined,
        [nodeValueSymbol]: true,
    };
}

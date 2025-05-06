import assert from 'node:assert';

export interface Child<P extends CommentedCollectionNode> {
    parent?: P | undefined;
}

export interface NodeComments {
    comment?: Comment | undefined;
    commentBefore?: Comment | undefined;
}

export interface CommentedBaseNode extends NodeComments {
    parent?: CommentedCollectionNode | undefined;
}

export interface CommentedScalar<T> extends CommentedBaseNode {
    readonly value: T;
    set(value: T): void;
}

export type ScalarNumber = CommentedScalar<number>;
export type ScalarString = CommentedScalar<string>;
export type ScalarBoolean = CommentedScalar<boolean>;
export type ScalarUndefined = CommentedScalar<undefined>;
export type ScalarNull = CommentedScalar<null>;

export interface Comment {
    comment: string;
    block?: boolean | undefined;
}

export type CommentedNode<T> = T extends number | string | boolean | null | undefined
    ? CommentedScalar<T>
    : T extends []
      ? CommentedArrayNode<T[number]>
      : T extends object
        ? CommentedRecordNode<T>
        : never;

export interface CommentedCollectionNode extends CommentedBaseNode {
    /**
     * Check if a node exists in the collection.
     * @param n - node to check for.
     * @returns true if the node is in the collection.
     */
    has(n: CommentedBaseNode): boolean;
    /**
     * Remove a node from the collection.
     * @param n - node to remove
     * @returns true if the node was removed
     */
    remove(n: CommentedBaseNode): boolean;
    /**
     * The number of items in the collection.
     */
    readonly size: number;
}

type ChildNode<T, P extends CommentedCollectionNode> = CommentedNode<T> & Child<P>;

export interface CommentedArrayNode<T> extends CommentedCollectionNode, Iterable<CommentedNode<T>> {
    readonly value: T[];
    readonly items: ChildNode<T, this>[];
    get(index: number): ChildNode<T, this> | undefined;
    set(index: number, value: T | CommentedNode<T>): void;
    add(value: T | CommentedNode<T>): void;
}

export interface CommentedRecordNode<T>
    extends CommentedCollectionNode,
        Iterable<[keyof T, CommentedNode<T[keyof T]>]> {
    readonly value: T;
    readonly items: [keyof T, ChildNode<T[keyof T], this>][];
    get<K extends keyof T>(key: K): ChildNode<T[K], this> | undefined;
    set<K extends keyof T>(key: K, value: T[K] | CommentedNode<T[K]>): void;
}

export function createCommentedScalar(value: number, comments?: NodeComments): ScalarNode<number>;
export function createCommentedScalar(value: string, comments?: NodeComments): ScalarNode<string>;
export function createCommentedScalar(value: boolean, comments?: NodeComments): ScalarNode<boolean>;
export function createCommentedScalar(value: null, comments?: NodeComments): ScalarNode<null>;
export function createCommentedScalar(value: undefined, comments?: NodeComments): ScalarNode<undefined>;
export function createCommentedScalar<T>(value: T, comments?: NodeComments): ScalarNode<T>;
export function createCommentedScalar<T>(value: T, comments?: NodeComments): ScalarNode<T> {
    return new ScalarNode(value, comments);
}

export function isCommentedBaseNode(node: unknown): node is CommentedBaseNode {
    return node instanceof BaseNode;
}

export function isCommentedScalar(node: unknown): node is CommentedScalar<unknown> {
    return node instanceof ScalarNode;
}

export function isCommentedNode<T>(value: T | CommentedNode<T>): value is CommentedNode<T> {
    return isCommentedBaseNode(value);
}

class BaseNode {
    parent?: CommentedCollectionNode | undefined;
    comment?: Comment | undefined;
    commentBefore?: Comment | undefined;

    constructor(comments?: NodeComments) {
        this.comment = comments?.comment;
        this.commentBefore = comments?.commentBefore;
    }
}

class ScalarNode<T> extends BaseNode implements CommentedScalar<T> {
    constructor(
        public value: T,
        comments?: NodeComments,
    ) {
        super(comments);
    }

    set(value: T): void {
        this.value = value;
    }

    toJSON() {
        return this.value;
    }
}

abstract class CollectionNode extends BaseNode implements CommentedCollectionNode {
    abstract has(n: CommentedBaseNode): boolean;
    abstract remove(n: CommentedBaseNode): boolean;
    abstract get size(): number;
}

class ArrayNode<T> extends CollectionNode implements CommentedArrayNode<T> {
    readonly items: ChildNode<T, this>[];

    constructor(items: CommentedNode<T>[], comments?: NodeComments) {
        super(comments);
        this.items = items.map((item) => adoptChildNode(item, this));
    }

    get value(): T[] {
        return this.items.map((item) => item.value) as T[];
    }

    get size(): number {
        return this.items.length;
    }

    has(n: CommentedBaseNode): boolean {
        return this.items.includes(n as ChildNode<T, this>);
    }

    remove(n: CommentedBaseNode): boolean {
        const index = this.items.indexOf(n as ChildNode<T, this>);
        if (index >= 0) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }

    get(index: number): ChildNode<T, this> | undefined {
        return this.items[index];
    }

    set(index: number, value: T | CommentedNode<T>): void {
        this.items[index] = adoptValue(value, this);
    }

    add(value: T | CommentedNode<T>): void {
        this.items.push(adoptValue(value, this));
    }

    [Symbol.iterator](): IterableIterator<CommentedNode<T>> {
        return this.items[Symbol.iterator]();
    }

    toJSON() {
        return this.items;
    }

    static from<T>(arr: (T | CommentedNode<T>)[], comments?: NodeComments): ArrayNode<T> {
        const items = arr.map((item) => _createCommentedNode(item));
        return new ArrayNode(items, comments);
    }
}

class RecordNode<T extends object> extends CollectionNode implements CommentedRecordNode<T> {
    $map: Map<keyof T, ChildNode<T[keyof T], this>>;

    constructor(items: [keyof T, CommentedNode<T[keyof T]>][], comments?: NodeComments) {
        super(comments);
        this.$map = new Map(items.map(([key, item]) => [key, adoptChildNode(item, this)]));
    }

    get value(): T {
        return Object.fromEntries(this.items.map(([key, n]) => [key, n.value])) as T;
    }

    get items() {
        return [...this.$map.entries()];
    }

    get size(): number {
        return this.items.length;
    }

    has(n: CommentedBaseNode): boolean {
        return this.items.some(([, item]) => item === n);
    }

    remove(n: CommentedBaseNode): boolean {
        const index = this.items.findIndex(([, item]) => item === n);
        if (index >= 0) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }

    get<K extends keyof T>(key: K): ChildNode<T[K], this> | undefined {
        const found = this.items.find(([k]) => k === key);
        if (!found) return undefined;
        return found[1] as unknown as ChildNode<T[K], this>;
    }

    set<K extends keyof T>(key: K, value: T[K] | CommentedNode<T[K]>): void {
        const cValue = adoptValue(value, this);
        const cNodeValue = cValue as unknown as ChildNode<T[keyof T], this>;
        const found = this.items.find(([k]) => k === key);
        if (found) {
            found[1] = cNodeValue;
        } else {
            this.items.push([key, cNodeValue]);
        }
    }

    [Symbol.iterator](): IterableIterator<[keyof T, CommentedNode<T[keyof T]>]> {
        return this.items[Symbol.iterator]();
    }

    toJSON() {
        return Object.fromEntries(this.items);
    }

    static from<T extends object>(obj: T, comments?: NodeComments): RecordNode<T> {
        const items = Object.entries(obj).map(
            ([k, v]) => [k, createCommentedNode<T[keyof T]>(v)] as [keyof T, CommentedNode<T[keyof T]>],
        );
        return new RecordNode(items, comments);
    }
}

function _createCommentedNode<T>(value: T | CommentedNode<T>, comments?: NodeComments): CommentedNode<T> & BaseNode {
    if (isCommentedBaseNode(value)) return value;
    switch (typeof value) {
        case 'number':
        case 'string':
        case 'boolean':
        case 'undefined': {
            return createCommentedScalar<T>(value, comments) as unknown as CommentedNode<T>;
        }
        case 'object': {
            if (!value) return createCommentedScalar(value, comments) as unknown as CommentedNode<T>;
            const node = Array.isArray(value) ? ArrayNode.from(value, comments) : RecordNode.from(value, comments);
            return node as unknown as CommentedNode<T>;
        }
        default: {
            throw new Error(`Unsupported value type: ${typeof value}`);
        }
    }
}

export function createCommentedNode<T>(value: T, comments?: NodeComments): CommentedNode<T> {
    return _createCommentedNode(value, comments);
}

function adoptValue<T, P extends CommentedCollectionNode>(value: T | CommentedNode<T>, parent: P): ChildNode<T, P> {
    const node = isCommentedBaseNode(value) ? value : createCommentedNode(value);
    return adoptChildNode(node, parent);
}

function adoptChildNode<T, P extends CommentedCollectionNode>(node: CommentedNode<T>, parent: P): ChildNode<T, P> {
    assert(isCommentedBaseNode(node));
    node.parent?.remove(node);
    node.parent = parent;
    return node as ChildNode<T, P>;
}

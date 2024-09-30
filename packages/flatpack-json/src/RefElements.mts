import assert from 'node:assert';

import type {
    ArrayElement,
    BigIntElement,
    DateElement,
    Index,
    MapElement,
    ObjectElement,
    ObjectWrapperElement,
    RegExpElement,
    SetElement,
    SimplePrimitive,
    StringElement,
    SubStringElement,
} from './types.mjs';
import { ElementType } from './types.mjs';

export interface BaseRef {
    /** Unique id of the reference */
    id: number;
}

export type FnIndexLookup = (ref: RefElements | undefined) => Index;

export interface RefElement<T> extends BaseRef {
    toElement(lookupFn: FnIndexLookup): T;
    clone(): RefElement<T>;
    getDependencies(): RefElements[] | undefined;
}

export type RefElements =
    | ArrayRefElement
    | BigIntRefElement
    | DateRefElement
    | MapRefElement
    | ObjectRefElement
    | ObjectWrapperRefElement
    | PrimitiveRefElement<boolean>
    | PrimitiveRefElement<null>
    | PrimitiveRefElement<number>
    | PrimitiveRefElement<SimplePrimitive>
    | PrimitiveRefElement<string>
    | PrimitiveRefElement<undefined>
    | RegExpRefElement
    | SetRefElement
    | StringPrimitiveRefElement
    | StringConcatRefElement
    | SubStringRefElement;

export type StringRefElements = SubStringRefElement | StringConcatRefElement | StringPrimitiveRefElement;

export class BaseRefElement implements BaseRef {
    id = 0;

    setId(i: number): void {
        this.id = i;
    }
}

export class PrimitiveRefElementBase<T extends SimplePrimitive> extends BaseRefElement implements RefElement<T> {
    #v: T;
    constructor(value: T) {
        super();
        this.#v = value;
    }
    toElement(): T {
        return this.#v;
    }

    get value(): T {
        return this.#v;
    }

    clone(): PrimitiveRefElement<T> {
        return new PrimitiveRefElement(this.#v);
    }

    getDependencies(): undefined {
        return undefined;
    }
}

export class PrimitiveRefElement<T extends SimplePrimitive> extends PrimitiveRefElementBase<T> {
    constructor(value: T) {
        super(value);
    }

    static fromJSON<T extends SimplePrimitive>(value: T): PrimitiveRefElement<T> {
        return new PrimitiveRefElement(value);
    }
}

export class NumberRefElement extends PrimitiveRefElementBase<number> {
    constructor(value: number) {
        super(value);
    }

    static fromJSON(value: number): NumberRefElement {
        return new NumberRefElement(value);
    }
}

export class StringPrimitiveRefElement extends PrimitiveRefElementBase<string> {
    constructor(value: string) {
        super(value);
    }

    get length(): number {
        return this.value.length;
    }

    static fromJSON(value: string): StringPrimitiveRefElement {
        return new StringPrimitiveRefElement(value);
    }
}

export class ObjectRefElement extends BaseRefElement implements RefElement<ObjectElement> {
    #k: ArrayRefElement | undefined;
    #v: ArrayRefElement | undefined;
    constructor(keys?: ArrayRefElement, values?: ArrayRefElement) {
        super();
        this.#k = keys;
        this.#v = values;
    }

    keyRefs(): ArrayRefElement | undefined {
        return this.#k;
    }

    valueRefs(): ArrayRefElement | undefined {
        return this.#v;
    }

    setKeysAndValues(keys: ArrayRefElement | undefined, values: ArrayRefElement): void {
        assert(!keys || keys.length === values.length);
        this.#k = keys;
        this.#v = values;
    }

    toElement(lookup: FnIndexLookup): ObjectElement {
        return [ElementType.Object, lookup(this.#k), lookup(this.#v)];
    }

    clone(): ObjectRefElement {
        return new ObjectRefElement(this.#k, this.#v);
    }

    getDependencies(): RefElements[] | undefined {
        return [this.#k, this.#v].filter((r) => !!r);
    }

    static fromJSON(elem: ObjectElement, resolve: (index: number) => RefElements): ObjectRefElement {
        const keys = resolve(elem[1]);
        const values = resolve(elem[2]);
        if (isPrimitiveRefElement(values)) {
            assert(values.value === undefined);
            return new ObjectRefElement();
        }
        assert(keys instanceof ArrayRefElement || keys === undefined);
        assert(values instanceof ArrayRefElement || values === undefined);
        return new ObjectRefElement(keys, values);
    }
}

export class ObjectWrapperRefElement extends BaseRefElement implements RefElement<ObjectElement> {
    #v: RefElements | undefined;
    constructor(value?: RefElements) {
        super();
        this.#v = value;
    }

    setValue(value: RefElements): void {
        this.#v = value;
    }

    valueRef(): RefElements | undefined {
        return this.#v;
    }

    toElement(lookup: FnIndexLookup): ObjectWrapperElement {
        return [ElementType.Object, 0, lookup(this.#v)];
    }

    clone(): ObjectWrapperRefElement {
        return new ObjectWrapperRefElement(this.#v);
    }

    getDependencies(): RefElements[] | undefined {
        return this.#v ? [this.#v] : undefined;
    }

    static fromJSON(elem: ObjectWrapperElement, resolve: (index: number) => RefElements): ObjectWrapperRefElement {
        const values = resolve(elem[2]);
        assert(elem[1] === 0);
        return new ObjectWrapperRefElement(values);
    }
}

export class SetRefElement extends BaseRefElement implements RefElement<SetElement> {
    #v: ArrayRefElement | undefined;
    constructor(values?: ArrayRefElement) {
        super();
        this.#v = values;
    }

    setValues(values: ArrayRefElement): void {
        this.#v = values;
    }

    toElement(lookup: FnIndexLookup): SetElement {
        return [ElementType.Set, lookup(this.#v)];
    }

    clone(): SetRefElement {
        return new SetRefElement(this.#v);
    }

    getDependencies(): RefElements[] | undefined {
        return this.#v ? [this.#v] : undefined;
    }

    valueRefs(): ArrayRefElement | undefined {
        return this.#v;
    }

    static fromJSON(elem: SetElement, resolve: (index: number) => RefElements): SetRefElement {
        const values = resolve(elem[1]);
        assert(values instanceof ArrayRefElement || values === undefined);
        return new SetRefElement(values);
    }
}

export class MapRefElement extends BaseRefElement implements RefElement<MapElement> {
    #k: ArrayRefElement | undefined;
    #v: ArrayRefElement | undefined;

    constructor(keys?: ArrayRefElement, values?: ArrayRefElement) {
        super();
        this.#k = keys;
        this.#v = values;
    }

    setKeysAndValues(keys: ArrayRefElement, values: ArrayRefElement): void {
        assert(keys.length === values.length);
        this.#k = keys;
        this.#v = values;
    }

    toElement(lookup: FnIndexLookup): MapElement {
        return [ElementType.Map, lookup(this.#k), lookup(this.#v)];
    }

    clone(): MapRefElement {
        return new MapRefElement(this.#k, this.#v);
    }

    getDependencies(): RefElements[] | undefined {
        return [this.#k, this.#v].filter((r) => !!r);
    }

    keyRefs(): ArrayRefElement | undefined {
        return this.#k;
    }

    valueRefs(): ArrayRefElement | undefined {
        return this.#v;
    }

    static fromJSON(elem: MapElement, resolve: (index: number) => RefElements): MapRefElement {
        const keys = resolve(elem[1]);
        const values = resolve(elem[2]);
        assert(keys instanceof ArrayRefElement || keys === undefined);
        assert(values instanceof ArrayRefElement || values === undefined);
        return new MapRefElement(keys, values);
    }
}

export class RegExpRefElement extends BaseRefElement implements RefElement<RegExpElement> {
    #p: StringRefElements;
    #f: StringRefElements;

    constructor(pattern: StringRefElements, flags: StringRefElements) {
        super();
        this.#p = pattern;
        this.#f = flags;
    }

    toElement(lookup: FnIndexLookup): RegExpElement {
        return [ElementType.RegExp, lookup(this.#p), lookup(this.#f)];
    }

    get value(): RegExp {
        return new RegExp(this.#p.value, this.#f.value);
    }

    clone(): RegExpRefElement {
        return new RegExpRefElement(this.#p, this.#f);
    }

    getDependencies(): RefElements[] | undefined {
        return [this.#p, this.#f].filter((r) => !!r);
    }

    static fromJSON(elem: RegExpElement, resolve: (index: number) => RefElements): RegExpRefElement {
        const pattern = resolve(elem[1]);
        const flags = resolve(elem[2]);
        assert(isStringRefElements(pattern) || pattern === undefined);
        assert(isStringRefElements(flags) || flags === undefined);
        return new RegExpRefElement(pattern, flags);
    }
}

export class DateRefElement extends BaseRefElement implements RefElement<DateElement> {
    #v: number;

    constructor(value: number) {
        super();
        this.#v = value;
    }

    toElement(): DateElement {
        return [ElementType.Date, this.#v];
    }

    get value(): Date {
        return new Date(this.#v);
    }

    setTime(time: number): void {
        this.#v = time;
    }

    clone(): DateRefElement {
        return new DateRefElement(this.#v);
    }

    getDependencies(): undefined {
        return undefined;
    }

    static fromJSON(value: DateElement): DateRefElement {
        return new DateRefElement(value[1]);
    }
}

export class BigIntRefElement extends BaseRefElement implements RefElement<BigIntElement> {
    #v: PrimitiveRefElement<number> | StringRefElements;

    constructor(value: PrimitiveRefElement<number> | StringRefElements) {
        super();
        this.#v = value;
    }

    get value(): bigint {
        return BigInt(this.#v.value);
    }

    toElement(lookup: FnIndexLookup): BigIntElement {
        return [ElementType.BigInt, lookup(this.#v)];
    }

    clone(): BigIntRefElement {
        return new BigIntRefElement(this.#v);
    }

    getDependencies(): RefElements[] | undefined {
        return [this.#v];
    }

    static fromJSON(elem: BigIntElement, resolve: (index: number) => RefElements): BigIntRefElement {
        const value = resolve(elem[1]);
        assert(value instanceof NumberRefElement || isStringRefElements(value));
        return new BigIntRefElement(value);
    }
}

export class ArrayRefElement extends BaseRefElement implements RefElement<ArrayElement> {
    #v: RefElements[];
    #hash = 0;
    constructor(values?: RefElements[]) {
        super();
        this.#v = values || [];
        this.#updateHash();
    }

    get hash(): number {
        return this.#hash;
    }

    #updateHash(): void {
        if (!this.#v.length) {
            this.#hash = 0;
        }
        this.#hash = simpleHash(this.#v.map((v) => v.id));
    }

    setValues(values: RefElements[]): void {
        this.#v = values;
        this.#updateHash();
    }

    valueRefs(): RefElements[] {
        return this.#v;
    }

    toElement(lookup: FnIndexLookup): ArrayElement {
        return [ElementType.Array, ...this.#v.map(lookup)];
    }

    get length(): number {
        return this.#v.length;
    }

    isEqual(other: ArrayRefElement): boolean {
        if (this.length !== other.length) return false;
        for (let i = 0; i < this.length; ++i) {
            if (this.#v[i] !== other.#v[i]) return false;
        }
        return true;
    }

    clone(): ArrayRefElement {
        return new ArrayRefElement(this.#v);
    }

    getDependencies(): RefElements[] | undefined {
        return this.#v;
    }

    static fromJSON(elem: ArrayElement, resolve: (index: number) => RefElements): ArrayRefElement {
        const values = elem.slice(1).map(resolve);
        return new ArrayRefElement(values);
    }
}

function simpleHash(values: readonly number[]): number {
    let hash = Math.sqrt(values.length);
    for (const value of values) {
        hash += value * value;
    }
    return hash;
}

export class SubStringRefElement extends BaseRefElement implements RefElement<SubStringElement | string> {
    #v: StringRefElements;
    #l: number;
    #o?: number | undefined;
    constructor(value: StringRefElements, len: number, offset?: number) {
        super();
        this.#v = value;
        this.#l = len;
        this.#o = offset;
    }
    toElement(lookup: FnIndexLookup): SubStringElement | string {
        const elm: SubStringElement = this.#o
            ? [ElementType.SubString, lookup(this.#v), this.#l, this.#o]
            : [ElementType.SubString, lookup(this.#v), this.#l];
        const v = this.value;
        return JSON.stringify(elm).length < JSON.stringify(v).length ? elm : v;
    }

    get value(): string {
        const offset = this.#o || 0;
        const v = this.#v.value.slice(offset, offset + this.#l);
        return v;
    }

    get length(): number {
        return this.#l;
    }

    clone(): SubStringRefElement {
        return new SubStringRefElement(this.#v, this.#l, this.#o);
    }

    getDependencies(): RefElements[] | undefined {
        return [this.#v];
    }

    static fromJSON(elem: SubStringElement, resolve: (index: number) => RefElements): SubStringRefElement {
        const idx = resolve(elem[1]);
        assert(isStringRefElements(idx));
        return new SubStringRefElement(idx, elem[2], elem[3]);
    }
}

export class StringConcatRefElement extends BaseRefElement implements RefElement<StringElement | string> {
    #v: StringRefElements[];
    #s: string = '';
    #l = 0;
    constructor(values: StringRefElements[]) {
        super();
        this.#v = values;
    }
    toElement(lookup: FnIndexLookup): StringElement | string {
        const elem: StringElement = [ElementType.String, ...this.#v.map(lookup)];
        const v = this.value;
        return JSON.stringify(elem).length < JSON.stringify(v).length ? elem : v;
    }

    get value(): string {
        if (!this.#s) {
            this.#s = this.#v.map((r) => r.value).join('');
        }
        return this.#s;
    }

    get length(): number {
        if (!this.#l) {
            this.#l = this.#v.reduce((acc, r) => acc + r.length, 0);
        }
        return this.#l;
    }

    clone(): StringConcatRefElement {
        return new StringConcatRefElement(this.#v);
    }

    getDependencies(): RefElements[] | undefined {
        return this.#v;
    }

    static fromJSON(elem: StringElement, resolve: (index: number) => RefElements): StringConcatRefElement {
        const values = elem.slice(1).map(resolve).filter(isStringRefElements);
        return new StringConcatRefElement(values);
    }
}

export function isStringRefElements(elem: RefElements): elem is StringRefElements {
    return (
        elem instanceof SubStringRefElement ||
        elem instanceof StringConcatRefElement ||
        elem instanceof StringPrimitiveRefElement
    );
}

export function isPrimitiveRefElement(elem: RefElements): elem is PrimitiveRefElement<SimplePrimitive> {
    return elem instanceof PrimitiveRefElementBase;
}

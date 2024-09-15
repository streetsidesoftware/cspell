import assert from 'node:assert';

import {
    type ArrayElement,
    type BigIntElement,
    type DateElement,
    ElementType,
    type Index,
    type MapElement,
    type ObjectElement,
    type RegExpElement,
    type SetElement,
    SimplePrimitive,
    type StringElement,
    type SubStringElement,
} from './types.mjs';

export interface IndexRef {
    /** Index */
    i: number;
}

export type FnIndexLookup = (ref: RefElement<unknown> | undefined) => Index;

export interface RefElement<T> extends IndexRef {
    toElement(lookupFn: FnIndexLookup): T;
    clone(): RefElement<T>;
    getDependencies(): RefElement<unknown>[] | undefined;
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

export class BaseRefElement implements IndexRef {
    i = 0;

    setId(i: number): void {
        this.i = i;
    }
}

export class PrimitiveRefElement<T extends SimplePrimitive> extends BaseRefElement implements RefElement<T> {
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

export class StringPrimitiveRefElement extends PrimitiveRefElement<string> {
    constructor(value: string) {
        super(value);
    }

    get length(): number {
        return this.value.length;
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

    keys(): ArrayRefElement | undefined {
        return this.#k;
    }

    values(): ArrayRefElement | undefined {
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

    getDependencies(): RefElement<unknown>[] | undefined {
        return [this.#k, this.#v].filter((r) => !!r);
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

    toElement(lookup: FnIndexLookup): ObjectElement {
        return [ElementType.Object, 0, lookup(this.#v)];
    }

    clone(): ObjectWrapperRefElement {
        return new ObjectWrapperRefElement(this.#v);
    }

    getDependencies(): RefElement<unknown>[] | undefined {
        return this.#v ? [this.#v] : undefined;
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

    getDependencies(): RefElement<unknown>[] | undefined {
        return this.#v ? [this.#v] : undefined;
    }

    values(): ArrayRefElement | undefined {
        return this.#v;
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

    getDependencies(): RefElement<unknown>[] | undefined {
        return [this.#k, this.#v].filter((r) => !!r);
    }

    keys(): ArrayRefElement | undefined {
        return this.#k;
    }

    values(): ArrayRefElement | undefined {
        return this.#v;
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

    clone(): RegExpRefElement {
        return new RegExpRefElement(this.#p, this.#f);
    }

    getDependencies(): RefElement<unknown>[] | undefined {
        return [this.#p, this.#f].filter((r) => !!r);
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

    clone(): DateRefElement {
        return new DateRefElement(this.#v);
    }

    getDependencies(): undefined {
        return undefined;
    }
}

export class BigIntRefElement extends BaseRefElement implements RefElement<BigIntElement> {
    #v: PrimitiveRefElement<number> | StringRefElements;

    constructor(value: PrimitiveRefElement<number> | StringRefElements) {
        super();
        this.#v = value;
    }

    toElement(lookup: FnIndexLookup): BigIntElement {
        return [ElementType.BigInt, lookup(this.#v)];
    }

    clone(): BigIntRefElement {
        return new BigIntRefElement(this.#v);
    }

    getDependencies(): RefElement<unknown>[] | undefined {
        return [this.#v];
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
        this.#hash = simpleHash(this.#v.map((v) => v.i));
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

    getDependencies(): RefElement<unknown>[] | undefined {
        return this.#v;
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

    getDependencies(): RefElement<unknown>[] | undefined {
        return [this.#v];
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

    getDependencies(): RefElement<unknown>[] | undefined {
        return this.#v;
    }
}

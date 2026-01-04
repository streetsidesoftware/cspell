import type { U8Array } from './TypedArray.ts';

export interface ArrayLike {
    readonly length: number;
    readonly [n: number]: number;
}

export class TypedArrayCursor<T extends ArrayLike> {
    array: T;
    i: number;
    done: undefined | boolean;
    length: number;

    constructor(array: T, i: number = 0, done?: boolean) {
        this.array = array;
        this.i = i;
        this.length = array.length;
        this.done = (done ?? (i >= this.length ? true : undefined)) || undefined;
    }

    cur(): number | undefined {
        return this.done ? undefined : this.array[this.i];
    }

    next(): number | undefined {
        if (this.done) return undefined;
        const i = ++this.i;
        if (i >= this.array.length) {
            this.done = true;
            return undefined;
        }
        return this.array[i];
    }
}

export type ArrayBufferLike = ArrayBuffer | SharedArrayBuffer;

export type Uint8ArrayCursor<TArrayBuffer extends ArrayBufferLike = ArrayBuffer> = TypedArrayCursor<
    Uint8Array<TArrayBuffer>
>;

export type U8ArrayCursor = TypedArrayCursor<U8Array>;

export function createUint8ArrayCursor<T extends Uint8Array>(array: T, i = 0): TypedArrayCursor<T> {
    return new TypedArrayCursor<T>(array, i);
}

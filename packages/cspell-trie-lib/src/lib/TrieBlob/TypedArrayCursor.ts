export interface ArrayLike {
    readonly length: number;
    readonly [n: number]: number;
}

export class TypedArrayCursor<T extends ArrayLike> {
    readonly array: T;
    i: number;
    done: undefined | boolean;
    length: number;

    constructor(array: T, i: number = 0) {
        this.array = array;
        this.i = i;
        this.length = array.length;
        this.done = i < 0 || i >= array.length ? true : undefined;
    }

    cur(): number | undefined {
        return this.done ? undefined : this.array[this.i];
    }

    next(): number | undefined {
        if (this.done) return undefined;
        let i = this.i;
        const value = this.array[i++];
        if (i >= this.array.length) this.done = true;
        this.i = i;
        return value;
    }
}

export type ArrayBufferLike = ArrayBuffer | SharedArrayBuffer;

export type Uint8ArrayCursor<TArrayBuffer extends ArrayBufferLike = ArrayBuffer> = TypedArrayCursor<
    Uint8Array<TArrayBuffer>
>;

export function createUint8ArrayCursor<T extends Uint8Array>(array: T, i = 0): TypedArrayCursor<T> {
    return new TypedArrayCursor<T>(array, i);
}

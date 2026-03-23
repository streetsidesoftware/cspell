import type { RefCounter } from './RefCounter.mjs';

export type SimplePrimitive = string | number | boolean | null | undefined;
export type Primitive = SimplePrimitive | RegExp | Date | bigint;
export type PrimitiveSet = Set<Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap>;
export type PrimitiveMap = Map<
    Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap,
    Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap
>;
export interface PrimitiveObject {
    readonly [key: string]: Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap;
}
export interface ObjectWrapper {
    valueOf(): PrimitiveObject;
}
export type PrimitiveArray = readonly (Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap)[];
type PrimitiveElement = Primitive;
export type Serializable = Primitive | PrimitiveObject | PrimitiveArray | PrimitiveSet | PrimitiveMap;
export enum ElementType {
    Array = 0,
    Object = 1,
    String = 2,
    SubString = 3,
    Set = 4,
    Map = 5,
    RegExp = 6,
    Date = 7,
    BigInt = 8,
    StringTable = 128,
}
interface EmptyObject {
    readonly t?: ElementType.Object;
}
type ObjectBasedElements = EmptyObject;

/**
 * Non-primitive elements.
 * An array is used to represent the element.
 * The first element is the type of the element.
 */
export type ArrayBasedElements =
    | ArrayElement
    | BigIntElement
    | DateElement
    | MapElement
    | ObjectElement
    | ObjectWrapperElement
    | RegExpElement
    | SetElement
    | StringElement
    | SubStringElement
    | StringTableElement;

/**
 * The absolute index of an element in the Flatpacked array. The first element is the header,
 * so the first element is at index 1.
 */
export type FlatpackIndex = number;
/**
 * A Compound string element. Each index is a reference to a string element that is concatenated
 * to form the final string.
 */
export type StringElement = readonly [type: ElementType.String, ...FlatpackIndex[]];
/**
 * A substring element. The first index is a reference to a string element.
 * The second index is the length of the substring.
 * The third index is the offset of the substring, defaults to 0.
 */
export type SubStringElement = readonly [type: ElementType.SubString, idx: FlatpackIndex, len: number, offset?: number];
/**
 * An object element. The first index is a reference to an array of keys.
 * The second index is a reference to an array of values.
 */
export type ObjectElement = readonly [type: ElementType.Object, keys: FlatpackIndex, values: FlatpackIndex];
/**
 * A Object wrapper element.
 */
export type ObjectWrapperElement = readonly [type: ElementType.Object, keys: 0, values: FlatpackIndex];
/**
 * A set element. The first index is a reference to an array of keys.
 */
export type SetElement = readonly [type: ElementType.Set, keys: FlatpackIndex];
/**
 * A map element. The first index is a reference to an array of keys.
 * The second index is a reference to an array of values.
 */
export type MapElement = readonly [type: ElementType.Map, keys: FlatpackIndex, values: FlatpackIndex];
/**
 * A regular expression element. The first index is a reference to a string element that represents the pattern.
 * The second index is a reference to a string element that represents the flags.
 */
export type RegExpElement = readonly [type: ElementType.RegExp, pattern: FlatpackIndex, flags: FlatpackIndex];
/**
 * A date element. The first index is the number of milliseconds since the epoch.
 */
export type DateElement = readonly [type: ElementType.Date, value: number];
export type BigIntElement = readonly [type: ElementType.BigInt, value: FlatpackIndex];
/**
 * An array element. Each index is a reference to an element.
 */
export type ArrayElement = readonly [type: ElementType.Array, ...FlatpackIndex[]];

export type EmptyElement = readonly [];

export type StringTableEntry = string | number[];

export type StringTableElement = readonly [type: ElementType.StringTable, ...StringTableEntry[]];

export type FlattenedElement = Readonly<
    PrimitiveElement | ObjectBasedElements | ArrayBasedElements | StringTableElement | EmptyElement
>;

type Header = string;
export type Flatpacked = [Header, ...FlattenedElement[]];
export type RawUnpacked = Serializable;
export type Unpacked = AnnotateUnpacked<RawUnpacked>;
export const blockSplitRegex: RegExp = /^sha\d/;

export interface FlatpackOptions {
    /**
     * Sort keys in objects.
     * Does not affect arrays, sets, or maps.
     */
    sortKeys?: boolean;
    /**
     * Dedupe objects and arrays.
     * Implies {@linkcode sortKeys}.
     * @default true
     */
    dedupe?: boolean;

    /**
     * Try to optimize the size of the output.
     */
    optimize?: boolean;

    /**
     * The format of the output. If not specified, the latest format will be used.
     */
    format?: 'V1' | 'V2';

    /**
     * Meta data to use when packing a value. This is used mainly to minimize the difference between the output of two similar values.
     */
    meta?: UnpackMetaData | undefined;
}

/**
 * Legacy header for Flatpack JSON.
 */
export const dataHeaderV0_1 = 'Dehydrated JSON v1' as const;
export const dataHeaderV1_0 = 'Flatpack JSON v1' as const;
export const dataHeaderV2_0 = 'Flatpack JSON v2' as const;

export type Headers = typeof dataHeaderV0_1 | typeof dataHeaderV1_0 | typeof dataHeaderV2_0;
/**
 * The current header for Flatpack JSON.
 */
export const dataHeader: string = dataHeaderV2_0;
/**
 * The set of supported headers for Flatpack JSON.
 */
export const supportedHeaders: Set<string> = new Set<string>([dataHeaderV0_1, dataHeaderV1_0, dataHeaderV2_0]);

export interface FlatpackApi {
    setValue(value: Serializable): void;
    toJSON(): Flatpacked;
    stringify(): string;
    toValue(): Unpacked;
}

export const symbolFlatpackAnnotation: unique symbol = Symbol.for('flatpackAnnotation');

export interface UnpackMetaData {
    /** The source of the unpacked data */
    flatpack: Flatpacked;
    /** The reference count of elements.  */
    referenced: RefCounter<number>;
    /**
     * The index of the root element in the flatpack.
     * In most cases, this will be 2 or 1 (if there is NOT a string table), but can be higher if there are more meta elements.
     * The string table is a meta element, and should be included before the root element if it exists.
     */
    rootIndex: FlatpackIndex;
}

export interface UnpackedAnnotation {
    meta: UnpackMetaData;
    index: number;
}

export interface UnpackedAnnotated {
    [symbolFlatpackAnnotation]?: UnpackedAnnotation;
}

export type AnnotateUnpacked<T> = T extends null ? T : T extends object ? T & UnpackedAnnotated : T;

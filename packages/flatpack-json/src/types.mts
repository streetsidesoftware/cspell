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

export type Index = number;
/**
 * A Compound string element. Each index is a reference to a string element that is concatenated
 * to form the final string.
 */
export type StringElement = readonly [type: ElementType.String, ...Index[]];
/**
 * A substring element. The first index is a reference to a string element.
 * The second index is the length of the substring.
 * The third index is the offset of the substring, defaults to 0.
 */
export type SubStringElement = readonly [type: ElementType.SubString, idx: Index, len: number, offset?: number];
/**
 * An object element. The first index is a reference to an array of keys.
 * The second index is a reference to an array of values.
 */
export type ObjectElement = readonly [type: ElementType.Object, keys: Index, values: Index];
/**
 * A Object wrapper element.
 */
export type ObjectWrapperElement = readonly [type: ElementType.Object, keys: 0, values: Index];
/**
 * A set element. The first index is a reference to an array of keys.
 */
export type SetElement = readonly [type: ElementType.Set, keys: Index];
/**
 * A map element. The first index is a reference to an array of keys.
 * The second index is a reference to an array of values.
 */
export type MapElement = readonly [type: ElementType.Map, keys: Index, values: Index];
/**
 * A regular expression element. The first index is a reference to a string element that represents the pattern.
 * The second index is a reference to a string element that represents the flags.
 */
export type RegExpElement = readonly [type: ElementType.RegExp, pattern: Index, flags: Index];
/**
 * A date element. The first index is the number of milliseconds since the epoch.
 */
export type DateElement = readonly [type: ElementType.Date, value: number];
export type BigIntElement = readonly [type: ElementType.BigInt, value: Index];
/**
 * An array element. Each index is a reference to an element.
 */
export type ArrayElement = readonly [type: ElementType.Array, ...Index[]];

export type StringTableEntry = string | number[];

export type StringTableElement = readonly [type: ElementType.StringTable, ...StringTableEntry[]];

export type FlattenedElement = Readonly<
    PrimitiveElement | ObjectBasedElements | ArrayBasedElements | StringTableElement
>;

type Header = string;
export type Flatpacked = [Header, ...FlattenedElement[]];
export type Unpacked = Readonly<Serializable>;
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
     * Use a string table to store unique strings and reference them by index.
     * This forces the format to be at least V2.
     */
    useStringTable?: boolean;
}

/**
 * Legacy header for Flatpack JSON.
 */
export const dataHeaderV0_1 = 'Dehydrated JSON v1' as const;
export const dataHeaderV1_0 = 'Flatpack JSON v1' as const;
export const dataHeaderV2_0 = 'Flatpack JSON v2' as const;
/**
 * The current header for Flatpack JSON.
 */
export const dataHeader: string = dataHeaderV1_0;
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

export function isStringTableElement(elem: FlattenedElement): elem is StringTableElement {
    if (!Array.isArray(elem)) {
        return false;
    }
    return elem[0] === ElementType.StringTable;
}

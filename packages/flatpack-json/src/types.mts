export type Primitive = string | number | boolean | null | undefined | RegExp | Date | bigint;
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
    | RegExpElement
    | SetElement
    | StringElement
    | SubStringElement;

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
export type SubStringElement = readonly [type: ElementType.SubString, Index, len: number, offset?: number];
/**
 * An object element. The first index is a reference to an array of keys.
 * The second index is a reference to an array of values.
 */
export type ObjectElement = readonly [type: ElementType.Object, keys: Index, values: Index];
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

export type Element = Readonly<PrimitiveElement | ObjectBasedElements | ArrayBasedElements>;

type Header = string;
export type Dehydrated = [Header, ...Element[]];
export type Hydrated = Readonly<Serializable>;
export const blockSplitRegex = /^sha\d/;

export interface NormalizeJsonOptions {
    sortKeys?: boolean;
    /**
     * Dedupe objects and arrays.
     * Implies `sortKeys`.
     */
    dedupe?: boolean;
}
export const dataHeader = 'Dehydrated JSON v1' as const;

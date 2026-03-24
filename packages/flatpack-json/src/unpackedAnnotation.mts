import type { Serializable, UnpackedAnnotated, UnpackedAnnotation, UnpackMetaData } from './types.mjs';
import { symbolFlatpackAnnotation } from './types.mjs';

/**
 * Get the annotation from an unpacked value. This is only available from values that have been unpacked with the
 * `UnpackedAnnotated` type. If the value is not annotated, this will return undefined.
 * @param data - The unpacked value to extract the meta data from.
 * @returns The meta data or undefined if the value is not annotated.
 */
export function extractUnpackedAnnotation(data: Serializable): UnpackedAnnotation | undefined {
    if (isUnpackedAnnotated(data)) {
        return data[symbolFlatpackAnnotation];
    }
    return undefined;
}

/**
 * Get the meta data from an unpacked value. This is only available from values that have been unpacked with the
 * `UnpackedAnnotated` type. If the value is not annotated, this will return undefined.
 * @param data - The unpacked value to extract the meta data from.
 * @returns The meta data or undefined if the value is not annotated.
 */
export function extractUnpackedMetaData(data: Serializable): UnpackMetaData | undefined {
    return extractUnpackedAnnotation(data)?.meta;
}

/**
 * Check if a value has an unpacked annotation. This is only available from values that have been unpacked with the
 * `UnpackedAnnotated` type.
 * @param value - any value to test
 * @returns `value` has UnpackedAnnotation.
 */
export function isUnpackedAnnotated<T>(value: T): value is T & UnpackedAnnotated {
    return typeof value === 'object' && value !== null && Object.hasOwn(value, symbolFlatpackAnnotation);
}

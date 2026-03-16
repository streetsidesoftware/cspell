import type { Serializable, UnpackedAnnotated, UnpackedAnnotation } from './types.mjs';
import { symbolFlatpackAnnotation } from './types.mjs';

export function extractUnpackedMetaData(data: Serializable): UnpackedAnnotation | undefined {
    if (isAnnotateUnpacked(data)) {
        return data[symbolFlatpackAnnotation];
    }
    return undefined;
}

export function isAnnotateUnpacked<T>(value: T): value is T & UnpackedAnnotated {
    return typeof value === 'object' && value !== null && Object.hasOwn(value, symbolFlatpackAnnotation);
}

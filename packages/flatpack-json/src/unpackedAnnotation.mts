import type { Serializable, UnpackedAnnotation, UnpackedMetaData } from './types.mjs';
import { symbolFlatpackAnnotation } from './types.mjs';

export function extractUnpackedMetaData(data: Serializable): UnpackedMetaData | undefined {
    if (isAnnotateUnpacked(data)) {
        return data[symbolFlatpackAnnotation];
    }
    return undefined;
}

export function isAnnotateUnpacked<T>(value: T): value is T & UnpackedAnnotation {
    return typeof value === 'object' && value !== null && Object.hasOwn(value, symbolFlatpackAnnotation);
}

import { CompactStorageV1 } from './storageV1.mjs';
import { CompactStorageV2 } from './storageV2.mjs';
import { stringifyFlatpacked } from './stringify.mjs';
import type { Flatpacked, FlatpackOptions, Serializable, Unpacked } from './types.mjs';
import { dataHeader, dataHeaderV1_0, dataHeaderV2_0 } from './types.mjs';

export function toJSON<V extends Serializable>(json: V, options?: FlatpackOptions): Flatpacked {
    let header = dataHeader;
    let stringTableAllowed = dataHeader !== dataHeaderV1_0;
    if (options?.format === 'V1') {
        header = dataHeaderV1_0;
        stringTableAllowed = false;
    }
    if (options?.format === 'V2') {
        header = dataHeaderV2_0;
        stringTableAllowed = true;
    }
    if (options?.useStringTable && !options.format) {
        header = dataHeaderV2_0;
        stringTableAllowed = true;
    }
    const useStringTable = stringTableAllowed && (options?.useStringTable || header === dataHeaderV2_0);
    options = { ...options, format: header === dataHeaderV1_0 ? 'V1' : 'V2', useStringTable };
    const v1 = header === dataHeaderV1_0;

    return v1 ? new CompactStorageV1(options).toJSON(json) : new CompactStorageV2(options).toJSON(json);
}

export function stringify(data: Unpacked, pretty = true, options?: FlatpackOptions): string {
    const json = toJSON(data, options);
    return pretty ? stringifyFlatpacked(json) : JSON.stringify(json);
}

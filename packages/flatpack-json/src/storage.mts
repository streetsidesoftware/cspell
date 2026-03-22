import { CompactStorageV1 } from './storageV1.mjs';
import { CompactStorageV2 } from './storageV2.mjs';
import type { StringifyOptions } from './stringify.mjs';
import { stringifyFlatpacked } from './stringify.mjs';
import type { Flatpacked, FlatpackOptions, Serializable, Unpacked } from './types.mjs';
import { dataHeader, dataHeaderV1_0, dataHeaderV2_0 } from './types.mjs';

export function toJSON<V extends Serializable>(json: V, options?: FlatpackOptions): Flatpacked {
    options = normalizeOptions(options);
    return options.format === 'V1'
        ? new CompactStorageV1(options).toJSON(json)
        : new CompactStorageV2(options).toJSON(json);
}

export function stringify(data: Unpacked, pretty = true, options?: FlatpackOptions & StringifyOptions): string {
    const normalizedOptions = normalizeOptions(options);
    const json = toJSON(data, normalizedOptions);
    const stringifyOptions: StringifyOptions | undefined =
        normalizedOptions.format === 'V1' ? undefined : options || {};
    return pretty ? stringifyFlatpacked(json, stringifyOptions) : JSON.stringify(json);
}

export function normalizeOptions(options?: FlatpackOptions): Required<FlatpackOptions> {
    let header = dataHeader;
    if (options?.format === 'V1') {
        header = dataHeaderV1_0;
    }
    if (options?.format === 'V2') {
        header = dataHeaderV2_0;
    }

    const dedupe = options?.dedupe ?? true;
    const sortKeys = options?.sortKeys || dedupe;

    const result: Required<FlatpackOptions> = {
        ...options,
        format: header === dataHeaderV1_0 ? 'V1' : 'V2',
        dedupe,
        sortKeys,
        optimize: options?.optimize ?? false,
        meta: options?.meta,
    };
    return result;
}

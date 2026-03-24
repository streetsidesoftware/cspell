import type { Flatpacked, FlatpackOptions, Serializable } from './types.mjs';

export interface CompactStorageApi {
    toJSON<V extends Serializable>(json: V): Flatpacked;
}

export abstract class CompactStorage implements CompactStorageApi {
    readonly options?: FlatpackOptions | undefined;
    constructor(options?: FlatpackOptions | undefined) {
        this.options = options;
    }
    abstract toJSON<V extends Serializable>(json: V): Flatpacked;
}

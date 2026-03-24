import { generateUnpackMetaData } from './flatpacked.mjs';
import { FlatpackedWrapper } from './flatpackUtil.mjs';
import { CompactStorageV2 } from './storageV2.mjs';
import { stringifyFlatpacked } from './stringify.mjs';
import type { FlatpackApi, Flatpacked, FlatpackOptions, Serializable, Unpacked } from './types.mjs';
import { fromJSON } from './unpack.mjs';

export class FlatpackStoreV2 implements FlatpackApi {
    storage: CompactStorageV2;
    value?: Serializable | undefined;

    constructor(
        value: Serializable | FlatpackedWrapper,
        readonly options?: FlatpackOptions | undefined,
    ) {
        options = options || {};
        options.format ??= 'V2';
        options.dedupe ??= true;
        options.sortKeys ??= options.dedupe;
        this.storage = new CompactStorageV2(options);
        const elements = value instanceof FlatpackedWrapper ? value.elements : this.storage.toJSON(value);
        const meta = generateUnpackMetaData(elements);
        this.storage.useFlatpackMetaData(meta);
        this.value = value instanceof FlatpackedWrapper ? fromJSON(value.elements) : value;
    }

    setValue(value: Serializable): void {
        this.value = value;
    }

    toJSON(): Flatpacked {
        return this.storage.toJSON(this.value);
    }

    static fromJSON(data: Flatpacked): FlatpackStoreV2 {
        return new FlatpackStoreV2(new FlatpackedWrapper(data));
    }

    static parse(content: string): FlatpackStoreV2 {
        return new FlatpackStoreV2(FlatpackedWrapper.parse(content));
    }

    stringify(): string {
        return stringifyFlatpacked(this.toJSON());
    }

    toValue(): Unpacked {
        return fromJSON(this.toJSON());
    }
}

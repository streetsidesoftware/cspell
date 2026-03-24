import { FlatpackedWrapper } from './flatpackUtil.mjs';
import { FlatpackStoreV2 } from './FlatpackV2.mjs';
import { stringifyFlatpacked } from './stringify.mjs';
import type { FlatpackApi, Flatpacked, FlatpackOptions, Serializable, Unpacked } from './types.mjs';
import { fromJSON } from './unpack.mjs';

export class FlatpackStore implements FlatpackApi {
    #flatpackApi: FlatpackApi;

    constructor(
        value: Serializable | FlatpackedWrapper,
        readonly options?: FlatpackOptions | undefined,
    ) {
        this.#flatpackApi = new FlatpackStoreV2(value, options);
    }

    setValue(value: Serializable): void {
        this.#flatpackApi.setValue(value);
    }

    toJSON(): Flatpacked {
        return this.#flatpackApi.toJSON();
    }

    static fromJSON(data: Flatpacked): FlatpackStore {
        return new FlatpackStore(new FlatpackedWrapper(data));
    }

    static parse(content: string): FlatpackStore {
        return new FlatpackStore(FlatpackedWrapper.parse(content));
    }

    stringify(): string {
        return stringifyFlatpacked(this.toJSON());
    }

    toValue(): Unpacked {
        return fromJSON(this.toJSON());
    }
}

export function toJSON<V extends Serializable>(json: V, options?: FlatpackOptions): Flatpacked {
    return new FlatpackStore(json, options).toJSON();
}

export function stringify(data: Unpacked, pretty = true): string {
    return pretty ? stringifyFlatpacked(toJSON(data)) : JSON.stringify(toJSON(data));
}

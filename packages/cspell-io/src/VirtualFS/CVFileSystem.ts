import { VFileSystem, VFileSystemCore, VFindUpPredicate, VFindUpURLOptions } from '../VFileSystem.js';
import { findUpFromUrl } from './findUpFromUrl.js';

export class CVFileSystem implements VFileSystem {
    #core: VFileSystemCore;

    readFile: VFileSystem['readFile'];
    writeFile: VFileSystem['writeFile'];
    stat: VFileSystem['stat'];
    readDirectory: VFileSystem['readDirectory'];
    getCapabilities: VFileSystem['getCapabilities'];

    constructor(core: VFileSystemCore) {
        this.#core = core;
        this.readFile = this.#core.readFile.bind(this.#core);
        this.writeFile = this.#core.writeFile.bind(this.#core);
        this.stat = this.#core.stat.bind(this.#core);
        this.readDirectory = this.#core.readDirectory.bind(this.#core);
        this.getCapabilities = this.#core.getCapabilities.bind(this.#core);
    }

    get providerInfo(): VFileSystem['providerInfo'] {
        return this.#core.providerInfo;
    }

    get hasProvider(): VFileSystem['hasProvider'] {
        return this.#core.hasProvider;
    }

    findUp(
        name: string | string[] | VFindUpPredicate,
        from: URL,
        options: VFindUpURLOptions = {},
    ): Promise<URL | undefined> {
        const opts = { ...options, fs: this.#core };
        return findUpFromUrl(name, from, opts);
    }
}

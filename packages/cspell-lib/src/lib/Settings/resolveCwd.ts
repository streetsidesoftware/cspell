import { toFileDirURL, toFileURL } from '@cspell/url';

export class CwdUrlResolver {
    #lastPath: string;
    #lastUrl: URL;
    #cwd: string;
    #cwdUrl: URL;

    constructor() {
        this.#cwd = process.cwd();
        this.#cwdUrl = toFileDirURL(this.#cwd);
        this.#lastPath = this.#cwd;
        this.#lastUrl = this.#cwdUrl;
    }
    resolveUrl(path?: string): URL {
        path = path || this.#cwd;
        if (path === this.#lastPath) return this.#lastUrl;
        if (path === this.#cwd) return this.#cwdUrl;
        this.#lastPath = path;
        this.#lastUrl = toFileURL(path);
        return this.#lastUrl;
    }

    reset(cwd: string = process.cwd()): void {
        this.#cwd = cwd;
        this.#cwdUrl = toFileDirURL(this.#cwd);
    }
}

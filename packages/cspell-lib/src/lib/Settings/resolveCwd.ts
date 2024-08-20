import { pathToFileURL } from 'node:url';

export class CwdUrlResolver {
    #lastPath: string;
    #lastUrl: URL;
    #cwd: string;
    #cwdUrl: URL;

    constructor() {
        this.#cwd = process.cwd();
        this.#cwdUrl = pathToFileURL(this.#cwd);
        this.#lastPath = this.#cwd;
        this.#lastUrl = this.#cwdUrl;
    }
    resolveUrl(path?: string): URL {
        path = path || this.#cwd;
        if (path === this.#lastPath) return this.#lastUrl;
        if (path === this.#cwd) return this.#cwdUrl;
        this.#lastPath = path;
        this.#lastUrl = pathToFileURL(path);
        return this.#lastUrl;
    }

    reset(cwd: string = process.cwd()) {
        this.#cwd = cwd;
        this.#cwdUrl = pathToFileURL(this.#cwd);
    }
}

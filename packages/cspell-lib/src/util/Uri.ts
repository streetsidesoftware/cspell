import assert from 'assert';
import { URI, Utils } from 'vscode-uri';

export interface Uri {
    readonly scheme: string;
    readonly path: string;
    readonly authority?: string;
    readonly fragment?: string;
    readonly query?: string;
}

export interface UriInstance extends Uri {
    toString(): string;
}

interface HRef {
    href: string;
}

const isFile = /^(?:[a-zA-Z]:|[/\\])/;
const isPossibleUri = /\w:\/\//;

const isUrl = /^(file:|stdin:|https?:|s?ftp:)/;

const STDIN_PROTOCOL = 'stdin:';

export function toUri(uriOrFile: string | Uri | URL): UriInstance {
    if (UriImpl.isUri(uriOrFile)) return uriOrFile;
    if (URI.isUri(uriOrFile)) return UriImpl.from(uriOrFile);
    if (uriOrFile instanceof URL) return UriImpl.parse(uriOrFile.toString());
    if (isUrlLike(uriOrFile)) return UriImpl.parse(uriOrFile.href);
    if (isUri(uriOrFile)) return UriImpl.from(uriOrFile);
    if (isUrl.test(uriOrFile)) return UriImpl.parse(uriOrFile);
    return isFile.test(uriOrFile) && !isPossibleUri.test(uriOrFile)
        ? UriImpl.file(normalizeDriveLetter(uriOrFile))
        : UriImpl.parse(uriOrFile);
}

const hasDriveLetter = /^[A-Z]:/i;

export function uriToFilePath(uri: Uri): string {
    const adj = uri.scheme === 'stdin' ? { scheme: 'file' } : {};

    return normalizeDriveLetter(URI.from(UriImpl.from(uri, adj)).fsPath);
}

export function fromFilePath(file: string): UriInstance {
    return UriImpl.file(file);
}

export function fromStdinFilePath(path?: string): UriInstance {
    return UriImpl.stdin(path);
}

export const file = fromFilePath;

export function parse(uri: string): UriInstance {
    return UriImpl.parse(uri);
}

export function normalizeDriveLetter(path: string): string {
    return hasDriveLetter.test(path) ? path[0].toLowerCase() + path.slice(1) : path;
}

function isUrlLike(url: unknown): url is HRef {
    return (!!url && typeof url === 'object' && typeof (<HRef>url).href === 'string') || false;
}

export function isUri(uri: unknown): uri is UriInstance {
    if (!uri || typeof uri !== 'object') return false;
    if (UriImpl.isUri(uri)) return true;
    if (URI.isUri(uri)) return true;
    const u = <Uri>uri;
    return typeof u.path === 'string' && typeof u.scheme === 'string';
}

export function basename(uri: Uri): string {
    return Utils.basename(URI.from(uri));
}

export function dirname(uri: Uri): UriInstance {
    return UriImpl.from(Utils.dirname(URI.from(uri)));
}

export function extname(uri: Uri): string {
    return Utils.extname(URI.from(uri));
}

export function joinPath(uri: Uri, ...paths: string[]): UriInstance {
    return UriImpl.from(Utils.joinPath(URI.from(uri), ...paths));
}

export function resolvePath(uri: Uri, ...paths: string[]): UriInstance {
    return UriImpl.from(Utils.resolvePath(URI.from(uri), ...paths));
}

export function from(uri: Uri, ...parts: Partial<Uri>[]): UriInstance {
    return UriImpl.from(uri, ...parts);
}

const keys: readonly (keyof Uri)[] = ['scheme', 'authority', 'path', 'query', 'fragment'] as const;

class UriImpl implements UriInstance {
    readonly scheme: string;
    readonly authority?: string;
    readonly path: string;
    readonly query?: string;
    readonly fragment?: string;

    constructor(uri: PartialWithUndefined<Uri>) {
        this.scheme = uri.scheme || '';
        uri.authority && (this.authority = uri.authority);
        this.path = uri.path || '';
        uri.query && (this.query = uri.query);
        uri.fragment && (this.fragment = uri.fragment);
    }

    toString(): string {
        const path = this.path;
        const base = `${this.scheme}://${this.authority || ''}${path}`;
        const query = (this.query && `?${this.query}`) || '';
        const fragment = (this.fragment && `#${this.fragment}`) || '';
        const url = base + query + fragment;

        return encodeURI(url);
    }

    toJson(): PartialWithUndefined<Uri> {
        const { scheme, authority, path, query, fragment } = this;
        return { scheme, authority, path, query, fragment };
    }

    with(change: Partial<Uri>): UriImpl {
        const { scheme, authority, path, query, fragment } = this;
        const u = { scheme, authority, path, query, fragment };
        for (const key of keys) {
            if (change[key] && typeof change[key] === 'string') {
                u[key] = change[key] as string;
            }
        }
        return new UriImpl(u);
    }

    static isUri(uri: unknown): uri is UriImpl {
        return uri instanceof UriImpl;
    }

    static from(uri: Uri, ...parts: Partial<Uri>[]): UriImpl {
        let u = new UriImpl(uri);
        for (const part of parts) {
            u = u.with(part);
        }
        return u;
    }

    static parse(uri: string): UriImpl {
        if (uri.startsWith(STDIN_PROTOCOL)) {
            return UriImpl.from(parseStdinUri(uri));
        }
        const u = URI.parse(uri);
        return UriImpl.from(u);
    }

    static file(filename: string): UriImpl {
        return UriImpl.from(URI.file(normalizeFilePath(filename)));
    }

    static stdin(filePath = '') {
        return UriImpl.from(UriImpl.file(filePath), { scheme: 'stdin' });
    }
}

function normalizeFilePath(path: string): string {
    return normalizeDriveLetter(path.replace(/\\/g, '/'));
}

function parseStdinUri(uri: string): Uri {
    assert(uri.startsWith(STDIN_PROTOCOL));

    const idxSlash = STDIN_PROTOCOL.length;
    let idxSlashEnd = idxSlash;
    for (; uri[idxSlashEnd] === '/'; ++idxSlashEnd) {
        // empty
    }
    const pathStart = idxSlashEnd;
    const iH = uri.indexOf('#', pathStart);
    const idxHash = iH > 0 ? iH : uri.length;
    const iQ = uri.indexOf('?', pathStart);
    const idxQ = iQ > 0 && iQ < idxHash ? iQ : idxHash;
    const pathEnd = idxQ;
    const path = uri.slice(pathStart, pathEnd);
    const query = idxQ < idxHash ? uri.slice(idxQ + 1, idxHash) : '';
    const hash = uri.slice(idxHash + 1);

    const pathPrefix = idxSlashEnd - idxSlash > 2 ? '/' : '';

    return {
        scheme: 'stdin',
        path: pathPrefix + normalizeFilePath(decodeURI(path)),
        query: decodeURI(query),
        fragment: decodeURI(hash),
    };
}

type PartialWithUndefined<T> = {
    [P in keyof T]?: T[P] | undefined;
};

export const __testing__ = {
    UriImpl,
    normalizeFilePath,
};

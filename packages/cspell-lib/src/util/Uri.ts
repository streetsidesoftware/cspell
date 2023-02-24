import { URI, Utils } from 'vscode-uri';

export interface Uri {
    readonly scheme: string;
    readonly path: string;
    readonly authority?: string;
    readonly fragment?: string;
    readonly query?: string;
}

export interface UriInstance extends Uri {
    toString(skipEncoding?: boolean): string;
}

interface HRef {
    href: string;
}

const isFile = /^(?:[a-zA-Z]:|[/\\])/;
const isPossibleUri = /\w:\/\//;

const isUrl = /^(file:|stdin:|https?:|s?ftp:)\/\//;

export function toUri(uriOrFile: string | Uri | URL): UriInstance {
    if (UriImpl.isUri(uriOrFile)) return uriOrFile;
    if (URI.isUri(uriOrFile)) return UriImpl.from(uriOrFile);
    if (uriOrFile instanceof URL) return UriImpl.parse(uriOrFile.toString());
    if (isUrlLike(uriOrFile)) return UriImpl.parse(uriOrFile.href);
    if (isUri(uriOrFile)) return UriImpl.from(uriOrFile);
    if (isUrl.test(uriOrFile)) return UriImpl.parse(uriOrFile);
    return isFile.test(uriOrFile) && !isPossibleUri.test(uriOrFile)
        ? UriImpl.file(normalizeFsPath(uriOrFile))
        : UriImpl.parse(uriOrFile);
}

const hasDriveLetter = /^[A-Z]:/i;

export function uriToFilePath(uri: Uri): string {
    return normalizeFsPath(URI.from(uri).fsPath);
}

export function fromFilePath(file: string): UriInstance {
    return UriImpl.file(file);
}

export function parse(uri: string): UriInstance {
    return UriImpl.parse(uri);
}

export function normalizeFsPath(path: string): string {
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

export function joinPath(uri: Uri): UriInstance {
    return UriImpl.from(Utils.joinPath(URI.from(uri)));
}

export function resolvePath(uri: Uri, ...paths: string[]): UriInstance {
    return UriImpl.from(Utils.resolvePath(URI.from(uri), ...paths));
}

class UriImpl implements UriInstance {
    readonly scheme: string;
    readonly authority?: string;
    readonly path: string;
    readonly query?: string;
    readonly fragment?: string;

    constructor(uri: Uri) {
        this.scheme = uri.scheme;
        uri.authority && (this.authority = uri.authority);
        this.path = uri.path;
        uri.query && (this.query = uri.query);
        uri.fragment && (this.fragment = uri.fragment);
    }

    toString(skipEncoding?: boolean): string {
        const base = `${this.scheme}://${this.authority || ''}${this.path}`;
        const query = (this.query && `?${this.query}`) || '';
        const fragment = (this.fragment && `#${this.fragment}`) || '';
        const url = base + query + fragment;

        return skipEncoding ? url : encodeURI(url);
    }

    toJson(): PartialWithUndefined<Uri> {
        const { scheme, authority, path, query, fragment } = this;
        return { scheme, authority, path, query, fragment };
    }

    static isUri(uri: unknown): uri is UriImpl {
        return uri instanceof UriImpl;
    }

    static from(uri: Uri): UriImpl {
        return new UriImpl(uri);
    }

    static parse(uri: string): UriImpl {
        const u = URI.parse(uri);
        // Is it relative?
        if (u.scheme === 'stdin' && u.authority) {
            return UriImpl.from({ ...u, scheme: u.scheme, path: u.authority + u.path, authority: '' });
        }
        return UriImpl.from(u);
    }

    static file(filename: string): UriImpl {
        return UriImpl.from(URI.file(filename));
    }
}

type PartialWithUndefined<T> = {
    [P in keyof T]?: T[P] | undefined;
};

export const __testing__ = {
    UriImpl,
};

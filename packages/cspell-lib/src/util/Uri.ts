import { URI, Utils } from 'vscode-uri';

export interface Uri {
    readonly scheme: string;
    readonly path: string;
    readonly authority?: string;
    readonly fragment?: string;
    readonly query?: string;
}

interface HRef {
    href: string;
}

const isFile = /^(?:[a-zA-Z]:|[/\\])/;
const isPossibleUri = /\w:\/\//;

const isUrl = /^(file:|stdin:|https?:|s?ftp:)\/\//;

export function toUri(uriOrFile: string | Uri | URL): Uri {
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

export function fromFilePath(file: string): Uri {
    return UriImpl.file(file);
}

export function normalizeFsPath(path: string): string {
    return hasDriveLetter.test(path) ? path[0].toLowerCase() + path.slice(1) : path;
}

function isUrlLike(url: unknown): url is HRef {
    return (!!url && typeof url === 'object' && typeof (<HRef>url).href === 'string') || false;
}

export function isUri(uri: unknown): uri is Uri {
    if (!uri || typeof uri !== 'object') return false;
    if (UriImpl.isUri(uri)) return true;
    if (URI.isUri(uri)) return true;
    const u = <Uri>uri;
    return typeof u.path === 'string' && typeof u.scheme === 'string';
}

export function basename(uri: Uri): string {
    return Utils.basename(URI.from(uri));
}

export function dirname(uri: Uri): Uri {
    return UriImpl.from(Utils.dirname(URI.from(uri)));
}

export function extname(uri: Uri): string {
    return Utils.extname(URI.from(uri));
}

export function joinPath(uri: Uri): Uri {
    return UriImpl.from(Utils.joinPath(URI.from(uri)));
}

export function resolvePath(uri: Uri, ...paths: string[]): Uri {
    return UriImpl.from(Utils.resolvePath(URI.from(uri), ...paths));
}

class UriImpl implements Uri {
    readonly scheme: string;
    readonly authority?: string;
    readonly path: string;
    readonly query?: string;
    readonly fragment?: string;

    constructor(uri: Uri) {
        const u = URI.from(uri);
        this.scheme = u.scheme;
        u.authority && (this.authority = u.authority);
        this.path = u.path;
        u.query && (this.query = u.query);
        u.fragment && (this.fragment = u.fragment);
    }

    toString(skipEncoding?: boolean): string {
        return URI.from(this).toString(skipEncoding);
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
        return UriImpl.from(URI.parse(uri));
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

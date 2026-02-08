export interface VFSErrorOptions {
    url?: URL | string | undefined;
    cause?: unknown;
    code?: string | number | undefined;
}

export class VFSError extends Error {
    readonly url?: string | undefined;
    readonly code?: string | number | undefined;
    constructor(message: string, options?: VFSErrorOptions) {
        super(message, options);
        this.name = 'VFSError';
        this.url = options?.url instanceof URL ? options.url.href : options?.url;
        this.code = options?.code;
    }
}

export class VFSNotSupported extends VFSError {
    constructor(methodName: string, url: URL) {
        super(`Method ${methodName} is not supported for ${url.href}`, { url });
    }
}

export class VFSNotImplemented extends VFSError {
    constructor(methodName: string, options?: VFSErrorOptions) {
        super(`Method ${methodName} is not implemented`, options);
    }
}

export class VFSNotFoundError extends VFSError {
    constructor(url: URL, options?: VFSErrorOptions) {
        super(`Not found: ${url.href}`, { ...options, url, code: options?.code ?? 'ENOENT' });
    }
}

export class VFSErrorUnsupportedRequest extends VFSError {
    constructor(
        public readonly request: string,
        url?: URL | string,
        public readonly parameters?: unknown,
    ) {
        super(`Unsupported request: ${request}`, { url });
    }
}

export class FetchUrlError extends Error implements NodeJS.ErrnoException {
    constructor(
        message: string,
        readonly code: string | undefined,
        readonly status: number | undefined,
        readonly url: URL
    ) {
        super(message);
        this.name = 'FetchUrlError';
    }

    static create(url: URL, status: number, message?: string): FetchUrlError {
        if (status === 404) return new FetchUrlError(message || 'URL not found.', 'ENOENT', status, url);
        if (status >= 400 && status < 500)
            return new FetchUrlError(message || 'Permission denied.', 'EACCES', status, url);
        return new FetchUrlError(message || 'Fatal Error', 'ECONNREFUSED', status, url);
    }
}

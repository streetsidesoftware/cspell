export interface Uri {
    readonly scheme: string;
    readonly path: string;
    readonly authority?: string;
    readonly fragment?: string;
    readonly query?: string;
}

export interface UriInstance extends Uri {
    toString(): string;
    toJSON(): unknown;
}

export type DocumentUri = Uri | URL | string;

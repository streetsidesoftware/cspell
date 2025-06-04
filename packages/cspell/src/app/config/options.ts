export interface InitOptions {
    output?: string;
    import?: string[];
    format?: 'yaml' | 'json' | 'jsonc';
    locale?: string;
    comments?: boolean;
    schema?: boolean;
    dictionary?: string[];
}

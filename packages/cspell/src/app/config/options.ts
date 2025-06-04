export interface InitOptions {
    output?: string;
    import?: string[];
    format?: 'yaml' | 'yml' | 'json' | 'jsonc';
    locale?: string;
    comments?: boolean;
    schema?: boolean;
    dictionary?: string[];
}

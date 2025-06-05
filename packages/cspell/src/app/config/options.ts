export interface BaseConfigOptions {
    /**
     * The path to the configuration file to create / update.
     * If not provided, a default file name will be used based on the format.
     */
    config?: string;
    /**
     * The list of configuration files or dictionary packages to import.
     * This can be a list of file paths, package names, or URLs.
     */
    import?: string[];
    /**
     * The locale to use when spell checking (e.g., en, en-US, de).
     */
    locale?: string;
    /**
     * Whether to add comments to the configuration file.
     * - `true` - comments will be added to the configuration file.
     * - `false` - no comments will be added.
     * - `undefined` - the default behavior will be used based on the format.
     */
    comments?: boolean;

    /**
     * Whether to remove all comments from the configuration file.
     * - `true` - all comments will be removed.
     * - `false` | `undefined` - no comments will be removed.
     * @implies `comments: false`
     */
    removeComments?: boolean;

    /**
     * Whether to add the schema reference to the configuration file.
     * - `true` - the schema reference will be added / updated.
     * - `false` - no schema reference will be added.
     */
    schema?: boolean;
    /**
     * The list of dictionaries to enable in the configuration file.
     * These are added to an existing configuration file or a new one.
     * Existing dictionaries will not be removed.
     */
    dictionary?: string[];

    /**
     * Whether to write the configuration to stdout instead of a file.
     */
    stdout?: boolean;
}

export interface InitOptions extends BaseConfigOptions {
    /**
     * The path where the configuration file will be written, it can be a file path or a URL.
     * If not provided, a default file name will be used based on the format.
     * The default will be `cspell.config.yaml` or `cspell.json` based on the format.
     * @conflicts `config` - If `config` is provided, it will be used instead of `output`.
     */
    output?: string;
    /**
     * The format of the configuration file.
     * @conflicts `config` - If `config` is provided, the format will be inferred from the file extension.
     */
    format?: 'yaml' | 'yml' | 'json' | 'jsonc';
}

export type UpdateConfigOptions = BaseConfigOptions;

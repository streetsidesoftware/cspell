export interface DictionaryContext {
    /** The file to spell check. */
    file: URL;
    /** The working directory. */
    cwd: URL;
}

export interface DynamicDictionary {
    name: string;
}

export interface DynamicDictionaryContext {
    /**
     * The url to the config file that defines the dictionary function.
     */
    configUrl: URL;

    /** The working directory. */
    cwd: URL;

    readFile(url: URL): Promise<Uint8Array>;
}

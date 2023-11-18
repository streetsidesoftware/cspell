import type { CSpellConfigFile } from './CSpellConfigFile.js';
import type { IO } from './IO.js';
import type { TextFile } from './TextFile.js';

export interface LoadRequestContext {
    /** A deserializer that can be used if necessary. */
    deserialize: (file: TextFile) => CSpellConfigFile;
    /** IO interface that can be used if necessary. */
    io: IO;
}

export interface LoadRequest {
    /** The url of the file to load. */
    url: URL;
    /** The context of the request. */
    context: LoadRequestContext;
}

export interface LoaderNext {
    (req: LoadRequest): Promise<CSpellConfigFile>;
}

export interface LoaderReducer {
    /**
     * If a loader can handle a given request, it returns a Promise<CSpellConfigFile>, otherwise it calls `next` with the request.
     */
    (req: LoadRequest, next: LoaderNext): Promise<CSpellConfigFile>;
}

export interface FileLoaderMiddleware {
    load: LoaderReducer;
    /** clear any cached values. */
    reset?: () => void;
}

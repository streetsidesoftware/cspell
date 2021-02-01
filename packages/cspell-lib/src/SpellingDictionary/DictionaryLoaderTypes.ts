import { ReplaceMap } from '@cspell/cspell-types';
import { SpellingDictionary } from './SpellingDictionary';

export interface LoadOptions {
    /**
     * Optional name of the dictionary.
     */
    name?: string;

    /**
     * Type of file:
     *  S - single word per line,
     *  C - each line is treated like code (Camel Case is allowed)
     * Default is C
     * C is the slowest to load due to the need to split each line based upon code splitting rules.
     */
    type?: LoaderType;
    /** Replacement Map */
    repMap?: ReplaceMap;
    /** Use Compounds */
    useCompounds?: boolean;
}

export type LoaderType = keyof Loaders;
export type Loader = (filename: string, options: LoadOptions) => Promise<SpellingDictionary>;

export interface Loaders {
    S: Loader;
    C: Loader;
    T: Loader;
    default: Loader;
}

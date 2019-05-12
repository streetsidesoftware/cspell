import { SpellingDictionary } from './SpellingDictionary';
import { ReplaceMap } from '../Settings';
export interface LoadOptions {
    type?: LoaderType;
    repMap?: ReplaceMap;
    useCompounds?: boolean;
}
export declare type LoaderType = keyof Loaders;
export declare type Loader = (filename: string, options: LoadOptions) => Promise<SpellingDictionary>;
export interface Loaders {
    S: Loader;
    W: Loader;
    C: Loader;
    T: Loader;
    default: Loader;
    [index: string]: Loader | undefined;
}
export declare function loadDictionary(uri: string, options: LoadOptions): Promise<SpellingDictionary>;

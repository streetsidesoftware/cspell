import { SpellingDictionary } from './SpellingDictionary';
export interface LoadOptions {
    type?: 'S' | 'W' | 'C';
}
export declare function loadDictionary(uri: string, options: LoadOptions): Promise<SpellingDictionary>;

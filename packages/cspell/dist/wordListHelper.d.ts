import { Observable } from 'rxjs';
export interface WordDictionary {
    [index: string]: boolean;
}
export declare type WordSet = Set<string>;
export declare function loadWordsRx(filename: string): Observable<string>;
export declare function splitLine(line: string): string[];
export declare function splitCodeWords(words: string[]): string[];
export declare function splitLineIntoCodeWordsRx(line: string): Observable<string>;
export declare function splitLineIntoWordsRx(line: string): Observable<string>;

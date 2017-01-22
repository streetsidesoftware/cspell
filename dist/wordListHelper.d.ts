import * as Rx from 'rxjs/Rx';
export interface WordDictionary {
    [index: string]: boolean;
}
export declare type WordSet = Set<string>;
export declare function loadWordsRx(filename: string): Rx.Observable<string>;
export declare function splitLine(line: string): string[];
export declare function splitCodeWords(words: string[]): string[];
export declare function splitLineIntoCodeWordsRx(line: string): Rx.Observable<string>;
export declare function splitLineIntoWordsRx(line: string): Rx.Observable<string>;
export declare function rxSplitIntoWords(lines: Rx.Observable<string>): Rx.Observable<string>;
export declare function rxSplitCamelCaseWords(words: Rx.Observable<string>): Rx.Observable<string>;

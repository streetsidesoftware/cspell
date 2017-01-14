import * as Rx from 'rx';
export declare function lineReader(filename: string, encoding?: string): Rx.Observable<string>;
export declare function textFileStream(filename: string, encoding?: string): Rx.Observable<string>;
export declare function stringsToLines(strings: Rx.Observable<string>): Rx.Observable<string>;

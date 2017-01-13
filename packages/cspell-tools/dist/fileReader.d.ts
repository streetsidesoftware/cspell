import * as Rx from 'rxjs/Rx';
export declare function lineReaderRx(filename: string, encoding?: string): Rx.Observable<string>;
export declare function textFileStreamRx(filename: string, encoding?: string): Rx.Observable<string>;
export declare function stringsToLinesRx(strings: Rx.Observable<string>): Rx.Observable<string>;

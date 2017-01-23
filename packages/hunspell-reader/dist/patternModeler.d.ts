import * as Rx from 'rxjs/Rx';
export interface PatternNode {
    count: number;
    connections: Map<string, PatternNode>;
    value: string;
    ratio?: number;
}
export declare function patternModeler(triEditFragments: Rx.Observable<string>): Rx.Observable<Pattern[]>;
export interface Pattern {
    value: string;
    count: number;
    savings: number;
    ratio: number;
}

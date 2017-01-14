import { AffInfo, Aff } from './aff';
export declare function parseAffFile(filename: string, encoding?: string): Rx.Promise<AffInfo>;
export declare function parseAff(lines: Rx.Observable<string>, encoding?: string): Rx.IPromise<AffInfo>;
export declare function parseAffFileToAff(filename: string, encoding?: string): Rx.Promise<Aff>;

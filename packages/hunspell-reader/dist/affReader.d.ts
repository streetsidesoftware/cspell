import { AffInfo, Aff } from './aff';
import * as Rx from 'rxjs/Rx';
export declare function parseAffFile(filename: string, encoding?: string): Promise<AffInfo>;
export declare function parseAff(lines: Rx.Observable<string>, encoding?: string): Promise<AffInfo>;
export declare function parseAffFileToAff(filename: string, encoding?: string): Promise<Aff>;

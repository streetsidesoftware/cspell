import { CSpellSettings } from './Settings';
import { Observable } from 'rxjs';
export interface TraceResult {
    word: string;
    found: boolean;
    dictName: string;
    dictSource: string;
    configSource: string;
}
export declare function traceWords(words: string[], settings: CSpellSettings): Observable<TraceResult>;

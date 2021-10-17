import type { TokenizedLineResult } from './types';

export interface DocumentParser {
    parse: (firstLine: string) => TokenizedLineResult;
}

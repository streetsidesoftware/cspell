import { Issue } from '@cspell/cspell-types';
import { FileInfo } from './fileHelper';

export interface FileResult {
    fileInfo: FileInfo;
    processed: boolean;
    issues: Issue[];
    errors: number;
    configErrors: number;
    elapsedTimeMs: number;
}

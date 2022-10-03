import glob from 'glob';
import { promisify } from 'util';

const pGlob = promisify(glob);

export function globP(pattern: string): Promise<string[]> {
    // Convert windows separators.
    pattern = pattern.replace(/\\/g, '/');
    return pGlob(pattern);
}

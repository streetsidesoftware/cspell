import { promisify } from 'util';
import glob from 'glob';

const pGlob = promisify(glob);

export function globP(pattern: string): Promise<string[]> {
    // Convert windows separators.
    pattern = pattern.replace(/\\/g, '/');
    return pGlob(pattern);
}

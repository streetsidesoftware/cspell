import type { FilterPattern } from 'unplugin';

export interface Options {
    include?: FilterPattern | undefined;
    exclude?: FilterPattern | undefined;
    enforce?: 'pre' | 'post' | undefined;
    debug?: boolean;
}

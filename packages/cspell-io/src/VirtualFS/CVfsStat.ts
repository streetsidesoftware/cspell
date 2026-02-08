import { FileType, type Stats } from '../models/Stats.js';
import { CFileType } from './CFileType.js';
import type { VfsStat } from './VFileSystem.js';

export class CVfsStat extends CFileType implements VfsStat {
    constructor(private stat: Stats) {
        super(stat.fileType || FileType.Unknown);
    }

    get size(): number {
        return this.stat.size;
    }

    get mtimeMs(): number {
        return this.stat.mtimeMs;
    }

    get eTag(): string | undefined {
        return this.stat.eTag;
    }
}

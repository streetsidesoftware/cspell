import { FileType } from '../models/Stats.js';

export class CFileType {
    constructor(readonly fileType: FileType) {}

    isFile(): boolean {
        return this.fileType === FileType.File;
    }

    isDirectory(): boolean {
        return this.fileType === FileType.Directory;
    }

    isUnknown(): boolean {
        return !this.fileType;
    }

    isSymbolicLink(): boolean {
        return !!(this.fileType & FileType.SymbolicLink);
    }
}

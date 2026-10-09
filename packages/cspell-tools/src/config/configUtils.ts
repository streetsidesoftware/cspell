import type { DictionarySource, FileListSource, FilePath, FileSource } from '../config/index.ts';

export function isFilePath(source: DictionarySource): source is FilePath {
    return typeof source === 'string';
}

export function isFileSource(source: DictionarySource): source is FileSource {
    return !source || isFilePath(source) ? false : (<FileSource>source).filename !== undefined;
}

export function isFileListSource(source: DictionarySource): source is FileListSource {
    return !source || isFilePath(source) ? false : (<FileListSource>source).listFile !== undefined;
}

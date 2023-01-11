import type { DictionarySource, FileListSource, FilePath, FileSource } from '../config';

export function isFilePath(source: DictionarySource): source is FilePath {
    return typeof source === 'string';
}

export function isFileSource(source: DictionarySource): source is FileSource {
    if (!source || isFilePath(source)) return false;
    return (<FileSource>source).filename !== undefined;
}

export function isFileListSource(source: DictionarySource): source is FileListSource {
    if (!source || isFilePath(source)) return false;
    return (<FileListSource>source).listFile !== undefined;
}

export type {
    CompileRequest,
    CompileTargetOptions,
    DictionaryFormats,
    DictionarySource,
    FileListSource,
    FilePath,
    FileSource,
    RunConfig,
    CompileSourceOptions as SourceOptions,
    Target,
} from './config';
export { isFileListSource, isFilePath, isFileSource } from './configUtils';
export { normalizeConfig } from './normalizeConfig';

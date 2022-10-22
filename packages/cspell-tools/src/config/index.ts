export type {
    CompileRequest,
    CompileSourceOptions,
    CompileTargetOptions,
    DictionaryFormats,
    DictionarySource,
    FileListSource,
    FilePath,
    FileSource,
    RunConfig,
    Target,
} from './config';
export { isFileListSource, isFilePath, isFileSource } from './configUtils';
export { normalizeConfig } from './normalizeConfig';

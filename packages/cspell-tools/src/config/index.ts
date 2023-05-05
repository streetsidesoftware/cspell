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
} from './config.js';
export { isFileListSource, isFilePath, isFileSource } from './configUtils.js';
export { normalizeConfig } from './normalizeConfig.js';

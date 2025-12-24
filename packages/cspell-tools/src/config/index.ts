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
} from './config.ts';
export { isFileListSource, isFilePath, isFileSource } from './configUtils.ts';
export { normalizeConfig } from './normalizeConfig.ts';

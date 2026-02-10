export { toArray as asyncIterableToArray } from './async/asyncIterable.js';
export * from './common/index.js';
export { compareStats, createTextFileResource } from './common/index.js';
export type { CSpellIO } from './CSpellIO.js';
export { CSpellIONode, getDefaultCSpellIO } from './CSpellIONode.js';
export {
    getStat,
    getStatSync,
    readFileText,
    readFileTextSync,
    writeToFile,
    writeToFileIterable,
    writeToFileIterableP,
} from './file/index.js';
export type { BufferEncoding, TextEncoding } from './models/BufferEncoding.js';
export type { FileReference, FileResource, TextFileResource } from './models/FileResource.js';
export type { Stats } from './models/Stats.js';
export { FileType as VFileType } from './models/Stats.js';
export { encodeDataUrl, toDataUrl } from './node/dataUrl.js';
export { isFileURL, isUrlLike, toFileURL, toURL, urlBasename, urlDirname } from './node/file/url.js';
export type {
    VFileSystem,
    VFileSystemCore,
    VFileSystemProvider,
    VFindEntryType,
    VFindUpPredicate,
    VFindUpURLOptions,
    VfsDirEntry,
    VfsStat,
    VirtualFS,
    VProviderFileSystem,
} from './VirtualFS/index.js';
export {
    createRedirectProvider,
    createVirtualFS,
    CSPELL_VFS_PROTOCOL,
    FSCapabilityFlags,
    getDefaultVirtualFs,
} from './VirtualFS/index.js';

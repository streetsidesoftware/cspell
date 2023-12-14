export { toArray as asyncIterableToArray } from './async/asyncIterable.js';
export * from './common/index.js';
export { createTextFileResource } from './common/index.js';
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
export type { Stats } from './models/Stats.js';
export { encodeDataUrl, toDataUrl } from './node/dataUrl.js';
export { isFileURL, isUrlLike, toFileURL, toURL, urlBasename, urlDirname } from './node/file/url.js';
export type { FileSystem, FileSystemProvider, VfsDirEntry, VfsStat, VirtualFS } from './VirtualFS.js';
export { createVirtualFS, FSCapabilityFlags, getDefaultVirtualFs } from './VirtualFS.js';

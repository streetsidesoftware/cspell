export { CVFileSystem } from './CVFileSystem.js';
export { createVirtualFS, getDefaultVirtualFs } from './CVirtualFS.js';
export { VFSError, VFSErrorUnsupportedRequest, VFSNotImplemented, VFSNotSupported } from './errors.js';
export { MemFileSystemProvider } from './MemVfsProvider.js';
export { createRedirectProvider } from './redirectProvider.js';
export type {
    UrlOrReference,
    VFileSystem,
    VFileSystemCore,
    VFindEntryType,
    VFindUpPredicate,
    VFindUpURLOptions,
    VfsDirEntry,
    VfsStat,
} from './VFileSystem.js';
export { FSCapabilityFlags } from './VFileSystem.js';
export type { NextProvider, VFileSystemProvider, VirtualFS, VProviderFileSystem } from './VirtualFS.js';

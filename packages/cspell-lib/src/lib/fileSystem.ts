import type { CSpellIO, FileSystemProvider } from 'cspell-io';
import { getDefaultCSpellIO, getDefaultVirtualFs } from 'cspell-io';

export type { FileSystemProvider, VfsDirEntry, VirtualFS } from 'cspell-io';
export { createTextFileResource, FileSystem, FSCapabilityFlags } from 'cspell-io';

export function getCSpellIO(): CSpellIO {
    return getDefaultCSpellIO();
}

export function getVirtualFS() {
    return getDefaultVirtualFs();
}

export function registerCSpell(fsp: FileSystemProvider) {
    const vfs = getVirtualFS();
    vfs.registerFileSystemProvider(fsp);
}

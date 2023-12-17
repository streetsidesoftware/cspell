import type { CSpellIO, VFileSystemProvider } from 'cspell-io';
import { getDefaultCSpellIO, getDefaultVirtualFs } from 'cspell-io';

export type { VFileSystemProvider, VfsDirEntry, VirtualFS } from 'cspell-io';
export { createTextFileResource, FSCapabilityFlags, VFileSystem } from 'cspell-io';

export function getCSpellIO(): CSpellIO {
    return getDefaultCSpellIO();
}

export function getVirtualFS() {
    return getDefaultVirtualFs();
}

export function getFileSystem() {
    return getVirtualFS().fs;
}

export function registerCSpell(fsp: VFileSystemProvider) {
    const vfs = getVirtualFS();
    vfs.registerFileSystemProvider(fsp);
}

import type { TextEncoding, VFileSystemProvider } from 'cspell-io';
import { getDefaultVirtualFs } from 'cspell-io';

export type { VFileSystemProvider, VfsDirEntry, VirtualFS } from 'cspell-io';
export { FSCapabilityFlags, VFileSystem } from 'cspell-io';

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

export async function readTextFile(url: URL, encoding: TextEncoding = 'utf8'): Promise<string> {
    const file = await getFileSystem().readFile(url, encoding);
    return file.getText();
}

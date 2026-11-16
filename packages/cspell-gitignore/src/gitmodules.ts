import type { VFileSystem } from 'cspell-io';
import { getDefaultVirtualFs } from 'cspell-io';

/**
 * Read the submodule folders listed in a repository's `.gitmodules` file.
 * @param repoRoot - the repository's root directory.
 * @param vfs - file system to read with.
 * @returns the URLs of the submodule folders, as strings, empty when there is no `.gitmodules` file.
 */
export async function readSubmoduleFolders(repoRoot: URL, vfs?: VFileSystem): Promise<Set<string>> {
    const fs = vfs || getDefaultVirtualFs().getFS(repoRoot);
    try {
        const file = await fs.readFile(new URL('.gitmodules', repoRoot), 'utf8');
        return new Set(parseSubmodulePaths(file.getText()).map((p) => toFolderUrl(p, repoRoot).href));
    } catch {
        return new Set();
    }
}

/**
 * Extract the `path` values of the `[submodule]` sections of a `.gitmodules` file.
 * @param content - the text of the file, in git's config format.
 * @returns the paths, relative to the repository root.
 */
export function parseSubmodulePaths(content: string): string[] {
    const paths: string[] = [];
    let inSubmodule = false;
    for (const line of content.split(/\r?\n/)) {
        const section = line.match(/^\s*\[\s*([^\s\]"]+)/);
        if (section) {
            inSubmodule = section[1].toLowerCase() === 'submodule';
            continue;
        }
        if (!inSubmodule) continue;
        const value = line.match(/^\s*path\s*=\s*(.*)$/i)?.[1];
        const path = value && parseValue(value);
        if (path) paths.push(path);
    }
    return paths;
}

/**
 * A config value is either quoted or ends at a comment.
 */
function parseValue(value: string): string {
    const quoted = value.match(/^"((?:[^"\\]|\\.)*)"/);
    if (quoted) return quoted[1].replaceAll(/\\(["\\])/g, '$1');
    return value.replace(/\s*[#;].*$/, '').trim();
}

function toFolderUrl(path: string, repoRoot: URL): URL {
    const relative = path
        .split('/')
        .filter((segment) => !!segment)
        .map(encodeURIComponent)
        .join('/');
    return new URL(relative + '/', repoRoot);
}

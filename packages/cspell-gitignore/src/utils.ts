import { toFileDirURL, toFileURL, urlRelative } from '@cspell/url';

export function isDefined<T>(v: T | undefined | null): v is T {
    return v !== undefined && v !== null;
}

/**
 * Compares only the paths, not the scheme or host.
 * VS Code can send the URL of a file with a scheme other than `file:`,
 * and it must still match a parent found through `file:`.
 */
export function isParentOf(parent: string | URL, child: URL): boolean {
    parent = toFileDirURL(parent);
    return child.pathname.startsWith(parent.pathname);
}

export function makeRelativeTo(child: string | URL, parent: string | URL): string | undefined {
    const c = toFileURL(child);
    const p = toFileDirURL(parent);
    const rel = urlRelative(p, c);
    if (rel.startsWith('../')) return undefined;
    return rel;
}

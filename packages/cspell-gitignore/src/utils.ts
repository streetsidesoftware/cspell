import { toFileDirURL, toFileURL, urlRelative } from '@cspell/url';

export function isDefined<T>(v: T | undefined | null): v is T {
    return v !== undefined && v !== null;
}

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

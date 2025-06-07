import type { DictionaryPathFormat } from './DictionaryPathFormat.js';

export interface PathInterface {
    relative(from: string, to: string): string;
    basename(path: string): string;
    sep: string;
}

export function trimMidPath(s: string, w: number, sep: string): string {
    if (s.length <= w) return s;
    const parts = s.split(sep);
    if (parts[parts.length - 1].length > w) return trimMid(s, w);

    function join(left: number, right: number) {
        // if (left === right) return parts.join(sep);
        return [...parts.slice(0, left), '…', ...parts.slice(right)].join(sep);
    }

    let left = 0,
        right = parts.length,
        last = '';
    for (let i = 0; i < parts.length; ++i) {
        const incLeft = i & 1 ? 1 : 0;
        const incRight = incLeft ? 0 : -1;
        const next = join(left + incLeft, right + incRight);
        if (next.length > w) break;
        left += incLeft;
        right += incRight;
        last = next;
    }
    for (let i = left + 1; i < right; ++i) {
        const next = join(i, right);
        if (next.length > w) break;
        last = next;
    }
    for (let i = right - 1; i > left; --i) {
        const next = join(left, i);
        if (next.length > w) break;
        last = next;
    }
    return last || trimMid(s, w);
}

export function trimMid(s: string, w: number): string {
    s = s.trim();
    if (s.length <= w) {
        return s;
    }
    const l = Math.floor((w - 1) / 2);
    const r = Math.ceil((w - 1) / 2);
    return s.slice(0, l) + '…' + s.slice(-r);
}

export function formatDictionaryLocation(
    dictSource: string,
    maxWidth: number,
    {
        cwd,
        dictionaryPathFormat: format,
        iPath,
    }: {
        cwd: string;
        dictionaryPathFormat: DictionaryPathFormat;
        iPath: PathInterface;
    },
): string {
    let relPath = cwd ? iPath.relative(cwd, dictSource) : dictSource;
    const idxNodeModule = relPath.lastIndexOf('node_modules');
    const isNodeModule = idxNodeModule >= 0;
    if (format === 'hide') return '';
    if (format === 'short') {
        const prefix = isNodeModule
            ? '[node_modules]/'
            : relPath.startsWith('..' + iPath.sep + '..')
              ? '…/'
              : relPath.startsWith('..' + iPath.sep)
                ? '../'
                : '';
        return prefix + iPath.basename(dictSource);
    }
    if (format === 'full') return dictSource;
    relPath = isNodeModule ? relPath.slice(idxNodeModule) : relPath;
    const usePath = relPath.length < dictSource.length ? relPath : dictSource;
    return trimMidPath(usePath, maxWidth, iPath.sep);
}

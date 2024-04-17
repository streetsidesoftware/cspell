import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface FindUpOptions {
    cwd?: string;
    type?: 'file' | 'directory';
    stopAt?: string;
}

type FindUpPredicate = (dir: string) => string | undefined | Promise<string | undefined>;

export async function findUp(
    name: string | string[] | FindUpPredicate,
    options: FindUpOptions = {},
): Promise<string | undefined> {
    const { cwd = process.cwd(), type: entryType = 'file', stopAt } = options;
    let dir = path.resolve(toDirPath(cwd));
    const root = path.parse(dir).root;
    const predicate = makePredicate(name, entryType);
    const stopAtDir = path.resolve(toDirPath(stopAt || root));

    while (dir !== root && dir !== stopAtDir) {
        const found = await predicate(dir);
        if (found !== undefined) return found;
        dir = path.dirname(dir);
    }
    return undefined;
}

function makePredicate(name: string | string[] | FindUpPredicate, entryType: 'file' | 'directory'): FindUpPredicate {
    if (typeof name === 'function') return name;

    const checkStat = entryType === 'file' ? 'isFile' : 'isDirectory';

    function checkName(dir: string, name: string) {
        const f = path.join(dir, name);
        return stat(f)
            .then((stats) => (stats[checkStat]() && f) || undefined)
            .catch(() => undefined);
    }

    if (!Array.isArray(name)) return (dir) => checkName(dir, name);

    return async (dir) => {
        const pending = name.map((n) => checkName(dir, n));
        for (const p of pending) {
            const found = await p;
            if (found) return found;
        }
        return undefined;
    };
}

function toDirPath(urlOrPath: string | URL) {
    return urlOrPath instanceof URL ? fileURLToPath(new URL('.', urlOrPath)) : urlOrPath;
}

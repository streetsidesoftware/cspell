import type { Issue } from '@cspell/cspell-types';
import * as path from 'path';

import type { LinterOptions } from '../options.js';
import type { GlobSrcInfo } from '../util/glob.js';
import { calcExcludeGlobInfo } from '../util/glob.js';
import type { FinalizedReporter } from '../util/reporters.js';

const defaultContextRange = 20;

interface Deprecated {
    fileLists?: LinterOptions['fileList'];
    local?: LinterOptions['locale'];
}

export class LintRequest {
    readonly uniqueFilter: (issue: Issue) => boolean;
    readonly locale: string;

    readonly configFile: string | undefined;
    readonly excludes: GlobSrcInfo[];
    readonly root: string;
    readonly showContext: number;
    readonly enableGlobDot: boolean | undefined;
    readonly fileLists: string[];
    readonly files: string[] | undefined;

    constructor(
        readonly fileGlobs: string[],
        readonly options: LinterOptions & Deprecated,
        readonly reporter: FinalizedReporter,
    ) {
        this.root = path.resolve(options.root || process.cwd());
        this.configFile = options.config;
        this.excludes = calcExcludeGlobInfo(this.root, options.exclude);
        this.locale = options.locale ?? options.local ?? '';
        this.enableGlobDot = options.dot;
        // this.uniqueFilter = options.unique ? util.uniqueFilterFnGenerator((issue: Issue) => issue.text) : () => true;
        this.uniqueFilter = () => true;
        this.showContext =
            options.showContext === true ? defaultContextRange : options.showContext ? options.showContext : 0;
        this.fileLists = (options.fileList ?? options.fileLists) || [];
        this.files = mergeFiles(options.file, options.files);
    }
}

function mergeFiles(a: string[] | undefined, b: string[] | undefined): string[] | undefined {
    const files = merge(a, b);
    if (!files) return undefined;
    return [...new Set(files.flatMap((a) => a.split('\n').map((a) => a.trim())).filter((a) => !!a))];
}

function merge<T>(a: T[] | undefined, b: T[] | undefined): T[] | undefined {
    if (!a) return b;
    if (!b) return a;
    return [...a, ...b];
}

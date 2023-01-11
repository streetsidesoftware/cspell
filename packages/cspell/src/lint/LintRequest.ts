import type { CSpellReporter, Issue } from '@cspell/cspell-types';
import * as path from 'path';

import type { LinterOptions } from '../options';
import type { GlobSrcInfo } from '../util/glob';
import { calcExcludeGlobInfo } from '../util/glob';
import * as util from '../util/util';

const defaultContextRange = 20;

interface Deprecated {
    fileLists?: LinterOptions['fileList'];
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

    constructor(
        readonly fileGlobs: string[],
        readonly options: LinterOptions & Deprecated,
        readonly reporter: CSpellReporter
    ) {
        this.root = path.resolve(options.root || process.cwd());
        this.configFile = options.config;
        this.excludes = calcExcludeGlobInfo(this.root, options.exclude);
        this.locale = options.locale || '';
        this.enableGlobDot = options.dot;
        this.uniqueFilter = options.unique ? util.uniqueFilterFnGenerator((issue: Issue) => issue.text) : () => true;
        this.showContext =
            options.showContext === true ? defaultContextRange : options.showContext ? options.showContext : 0;
        this.fileLists = (options.fileList ?? options.fileLists) || [];
    }
}

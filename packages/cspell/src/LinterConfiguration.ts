import type { CSpellReporter, Issue } from '@cspell/cspell-types';
import * as path from 'path';
import { LinterOptions } from './options';
import { calcExcludeGlobInfo, GlobSrcInfo } from './util/glob';
import * as util from './util/util';

const defaultContextRange = 20;

export class LinterConfiguration {
    readonly uniqueFilter: (issue: Issue) => boolean;
    readonly locale: string;

    readonly configFile: string | undefined;
    readonly excludes: GlobSrcInfo[];
    readonly root: string;
    readonly showContext: number;
    readonly enableGlobDot: boolean | undefined;

    constructor(readonly files: string[], readonly options: LinterOptions, readonly reporter: CSpellReporter) {
        this.root = path.resolve(options.root || process.cwd());
        this.configFile = options.config;
        this.excludes = calcExcludeGlobInfo(this.root, options.exclude);
        this.locale = options.locale || options.local || '';
        this.enableGlobDot = options.dot;
        this.uniqueFilter = options.unique ? util.uniqueFilterFnGenerator((issue: Issue) => issue.text) : () => true;
        this.showContext =
            options.showContext === true ? defaultContextRange : options.showContext ? options.showContext : 0;
    }
}

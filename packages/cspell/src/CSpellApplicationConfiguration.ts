import type { CSpellReporter, Issue } from '@cspell/cspell-types';
import * as path from 'path';
import { CSpellApplicationOptions } from './options';
import { calcExcludeGlobInfo, GlobSrcInfo } from './util/glob';
import { IOptions } from './util/IOptions';
import * as util from './util/util';

const defaultContextRange = 20;

// cspell:word nocase
const defaultMinimatchOptions: IOptions = { nocase: true };
export const defaultConfigGlobOptions: IOptions = defaultMinimatchOptions;

export class CSpellApplicationConfiguration {
    readonly uniqueFilter: (issue: Issue) => boolean;
    readonly locale: string;

    readonly configFile: string | undefined;
    readonly configGlobOptions: IOptions = defaultConfigGlobOptions;
    readonly excludes: GlobSrcInfo[];
    readonly root: string;
    readonly showContext: number;

    constructor(
        readonly files: string[],
        readonly options: CSpellApplicationOptions,
        readonly reporter: CSpellReporter
    ) {
        this.root = path.resolve(options.root || process.cwd());
        this.configFile = options.config;
        this.excludes = calcExcludeGlobInfo(this.root, options.exclude);
        this.locale = options.locale || options.local || '';
        this.uniqueFilter = options.unique ? util.uniqueFilterFnGenerator((issue: Issue) => issue.text) : () => true;
        this.showContext =
            options.showContext === true ? defaultContextRange : options.showContext ? options.showContext : 0;
    }
}

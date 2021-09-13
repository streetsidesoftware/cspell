import { GlobSrcInfo, calcExcludeGlobInfo } from './util/glob';
import * as path from 'path';
import * as util from './util/util';
import { IOptions } from './util/IOptions';
import { CSpellReporter, Issue } from '@cspell/cspell-types';
import { CSpellApplicationOptions } from './options';

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

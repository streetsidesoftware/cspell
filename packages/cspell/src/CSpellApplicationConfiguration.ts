import { GlobSrcInfo, calcExcludeGlobInfo } from './util/glob';
import * as path from 'path';
import * as util from './util/util';
import { IOptions } from './util/IOptions';
import {
    DebugEmitter,
    Emitters,
    MessageEmitter,
    MessageTypes,
    ProgressEmitter,
    SpellingErrorEmitter,
    Issue,
} from './emitters';
import { CSpellApplicationOptions } from './options';

const defaultContextRange = 20;
const nullEmitter: () => void = () => {
    /* empty */
};

// cspell:word nocase
const defaultMinimatchOptions: IOptions = { nocase: true };
export const defaultConfigGlobOptions: IOptions = defaultMinimatchOptions;

export class CSpellApplicationConfiguration {
    readonly info: MessageEmitter;
    readonly progress: ProgressEmitter;
    readonly debug: DebugEmitter;
    readonly logIssue: SpellingErrorEmitter;
    readonly uniqueFilter: (issue: Issue) => boolean;
    readonly locale: string;

    readonly configFile: string | undefined;
    readonly configGlobOptions: IOptions = defaultConfigGlobOptions;
    readonly excludes: GlobSrcInfo[];
    readonly root: string;
    readonly showContext: number;

    constructor(readonly files: string[], readonly options: CSpellApplicationOptions, readonly emitters: Emitters) {
        this.root = path.resolve(options.root || process.cwd());
        this.info = emitters.info || nullEmitter;
        this.debug = emitters.debug || ((msg: string) => this.info(msg, MessageTypes.Debug));
        this.configFile = options.config;
        this.excludes = calcExcludeGlobInfo(this.root, options.exclude);
        this.logIssue = emitters.issue || nullEmitter;
        this.locale = options.locale || options.local || '';
        this.uniqueFilter = options.unique ? util.uniqueFilterFnGenerator((issue: Issue) => issue.text) : () => true;
        this.progress = emitters.progress || nullEmitter;
        this.showContext =
            options.showContext === true ? defaultContextRange : options.showContext ? options.showContext : 0;
    }
}

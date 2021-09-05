import { ErrorEmitter, Issue, MessageType, ProgressFileComplete, ProgressItem, RunResult } from '@cspell/cspell-types';

export type CSpellJSONReporterOutput = {
    /**
     * Found spelling issues
     */
    issue: Array<Issue>;
    /**
     * CSpell execution logs
     */
    info: Array<{ message: string; msgType: MessageType }>;
    /**
     * CSpell debug logs
     */
    debug: Array<{ message: string }>;
    /**
     * CSpell error logs
     */
    error: Array<{ message: string; error: Parameters<ErrorEmitter>[1] }>;
    /**
     * CSpell file progress logs
     */
    progress: Array<ProgressItem | ProgressFileComplete>;
    /**
     * Execution result
     */
    result: RunResult;
};

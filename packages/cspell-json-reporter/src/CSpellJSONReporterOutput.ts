import type {
    ErrorLike,
    Issue,
    MessageType,
    ProgressFileComplete,
    ProgressItem,
    RunResult,
} from '@cspell/cspell-types';

export type CSpellJSONReporterOutput = {
    /**
     * Found spelling issues
     */
    issues: Array<Issue>;
    /**
     * CSpell execution logs
     */
    info?: Array<{ message: string; msgType: MessageType }>;
    /**
     * CSpell debug logs
     */
    debug?: Array<{ message: string }>;
    /**
     * CSpell error logs
     */
    error?: Array<{ message: string; error: ErrorLike }>;
    /**
     * CSpell file progress logs
     */
    progress?: Array<ProgressItem | ProgressFileComplete>;
    /**
     * Execution result
     */
    result: RunResult;
};

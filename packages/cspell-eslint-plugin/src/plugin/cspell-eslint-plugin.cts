// cspell:ignore TSESTree
import type { Rule } from 'eslint';
import { readFileSync } from 'fs';
import { join as pathJoin } from 'path';
import { createSyncFn } from 'synckit';

import { getDefaultLogger } from '../common/logger.cjs';
import type { Issue, SpellCheckSyncFn } from '../worker/types.cjs';
import { normalizeOptions } from './defaultCheckOptions.cjs';

const optionsSchema = JSON.parse(readFileSync(pathJoin(__dirname, '../../assets/options.schema.json'), 'utf8'));

const schema = optionsSchema as unknown as Rule.RuleMetaData['schema'];

const spellCheck: SpellCheckSyncFn = createSyncFn(require.resolve('../worker/worker.mjs'), undefined, 30000);

interface ExtendedSuggestion {
    /**
     * The suggestion.
     */
    word: string;
    /**
     * The word is preferred above others, except other "preferred" words.
     */
    isPreferred?: boolean;
    /**
     * The suggested word adjusted to match the original case.
     */
    wordAdjustedToMatchCase?: string;
}

interface PluginRules {
    ['spellchecker']: Rule.RuleModule;
}

const messages = {
    wordUnknown: 'Unknown word: "{{word}}"',
    wordForbidden: 'Forbidden word: "{{word}}"',
    suggestWord: '{{word}}{{preferred}}',
} as const;

type Messages = typeof messages;
type MessageIds = keyof Messages;

const meta: Rule.RuleMetaData = {
    docs: {
        description: 'CSpell spellchecker',
        category: 'Possible Errors',
        recommended: false,
    },
    messages,
    hasSuggestions: true,
    fixable: 'code',
    schema: [schema],
};

let isDebugMode = false;

function nullFix(): null {
    return null;
}

function create(context: Rule.RuleContext): Rule.RuleListener {
    const logger = getDefaultLogger();
    const log = logger.log;
    const options = normalizeOptions(context.options[0], context.cwd);
    const autoFix = options.autoFix;
    isDebugMode = options.debugMode ?? isDebugMode;
    logger.enabled = options.debugMode ?? (logger.enabled || isDebugMode);
    logContext(log, context);

    function reportIssue(issue: Issue) {
        const messageId: MessageIds = issue.severity === 'Forbidden' ? 'wordForbidden' : 'wordUnknown';
        const { word, start, end } = issue;
        const data = {
            word,
        };
        const code = context.sourceCode;
        const startPos = code.getLocFromIndex(start);
        const endPos = code.getLocFromIndex(end);
        const loc = { start: startPos, end: endPos };

        function fixFactory(word: string): Rule.ReportFixer {
            return (fixer) => fixer.replaceTextRange([start, end], word);
        }

        function createSug(sug: ExtendedSuggestion): Rule.SuggestionReportDescriptor {
            const word = sug.wordAdjustedToMatchCase || sug.word;
            const preferred = sug.isPreferred ? '*' : '';
            const data = { word, preferred };
            const messageId: MessageIds = 'suggestWord';

            return {
                messageId,
                data,
                fix: fixFactory(word),
            };
        }

        // log('Suggestions: %o', issue.suggestions);

        const issueSuggestions = issue.suggestions;
        const fixable = issueSuggestions?.filter((sug) => !!sug.isPreferred);
        const canFix = fixable?.length === 1;
        const preferredSuggestion = autoFix && canFix && fixable[0];
        const fix = preferredSuggestion
            ? fixFactory(preferredSuggestion.wordAdjustedToMatchCase || preferredSuggestion.word)
            : nullFix;
        const suggestions: Rule.ReportDescriptorOptions['suggest'] = issueSuggestions?.map((sug) => createSug(sug));
        const suggest = suggestions;

        const des: Rule.ReportDescriptor = {
            messageId,
            data,
            loc,
            suggest,
            fix,
        };
        context.report(des);
    }

    function checkProgram() {
        const sc = context.sourceCode;
        const { issues, errors } = spellCheck(context.filename, sc.text, sc.ast, options);
        if (errors && errors.length) {
            log(
                'errors: %o',
                errors.map((e) => e.message),
            );
            errors.forEach((error) => console.error('%s', error.message));
        }
        issues.forEach((issue) => reportIssue(issue));
    }

    return { Program: checkProgram };
}

export const rules: PluginRules = {
    spellchecker: {
        meta,
        create,
    },
};

function logContext(log: typeof console.log, context: Rule.RuleContext) {
    log('context: %o', {
        id: context.id,
        cwd: context.cwd,
        filename: context.filename,
        physicalFilename: context.physicalFilename,
        scope: context.getScope().type,
        options: context.options.length === 1 ? context.options[0] : context.options,
    });
}

export const configs = {
    recommended: {
        plugins: ['@cspell'],
        rules: {
            '@cspell/spellchecker': ['warn', {}],
        },
    },
    debug: {
        plugins: ['@cspell'],
        rules: {
            '@cspell/spellchecker': ['warn', { debugMode: true }],
        },
    },
};

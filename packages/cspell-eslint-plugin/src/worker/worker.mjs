// @ts-check

/* eslint-disable n/no-missing-import */

/**
 * @typedef {import('estree').Node} Node
 * @typedef {import('./types.cjs').Issue} Issue
 * @typedef {import('./types.cjs').SpellCheckResults} SpellCheckResults
 * @typedef {import('../common/options.cjs').WorkerOptions} WorkerOptions
 */

import { runAsWorker } from 'synckit';

/**
 * @type {typeof import('./spellCheck.mjs')}
 */
let spellChecker;

runAsWorker(
    /**
     * @param {string} filename
     * @param {string} text
     * @param {Node} root
     * @param {WorkerOptions} options
     * @returns {Promise<SpellCheckResults>} The issues found.
     */
    async (filename, text, root, options) => {
        if (!spellChecker) {
            spellChecker = await import('./spellCheck.mjs');
        }

        return spellChecker.spellCheck(filename, text, root, options);
    },
);

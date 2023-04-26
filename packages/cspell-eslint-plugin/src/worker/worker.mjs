/* eslint-disable import/no-unresolved */
/* eslint-disable node/no-missing-import */

// @ts-check

/**
 * @typedef {import('estree').Node} Node
 * @typedef {import('./types.js').Issue} Issue
 * @typedef {import('../common/options.js').WorkerOptions} WorkerOptions
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
     * @returns {Promise<Issue[]>} The issues found.
     */
    async (filename, text, root, options) => {
        if (!spellChecker) {
            spellChecker = await import('./spellCheck.mjs');
        }

        return spellChecker.spellCheck(filename, text, root, options);
    }
);

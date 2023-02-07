/* eslint-disable import/no-unresolved */
/* eslint-disable node/no-missing-import */

// @ts-check

/**
 * @typedef {import('estree').Node} Node
 * @typedef {import('./spellCheck.js').Issue} Issue
 * @typedef {import('../common/options').WorkerOptions} WorkerOptions
 */

const { runAsWorker } = require('synckit');

/**
 * @type {typeof import('./spellCheck.js')}
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
            spellChecker = await import('./spellCheck.js');
        }

        return spellChecker.spellCheck(filename, text, root, options);
    }
);

#!/usr/bin/env node

// @ts-check

import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';

/**
 * @import { Node, Root, Heading, Text } from 'mdast';
 * @import { Stats } from 'node:fs';
 */

/**
 * @typedef {{ tag: string; body: string; name: string; version: string; debug?: boolean }} ReleaseData
 */

const optionsToEnv = {
    tag: 'GITHUB_RELEASE_TAG',
    body: 'GITHUB_RELEASE_BODY',
    name: 'GITHUB_RELEASE_NAME',
    version: 'GITHUB_RELEASE_VERSION',
};

class AppError extends Error {
    /**
     *
     * @param {string} message
     * @param {string | undefined} [code]
     */
    constructor(message, code) {
        super(message);
        this.name = 'AppError';
        this.code = code;
    }
}

// cspell:ignore mdast

/**
 *
 * @param {Partial<ReleaseData>} releaseData
 * @returns {asserts releaseData is ReleaseData}
 */
function checkArgs(releaseData) {
    let ok = true;
    for (const [key, envVar] of Object.entries(optionsToEnv)) {
        if (!releaseData[key]) {
            console.error(`Error: Option --${key} Environment variable ${envVar} is not set.`);
            ok = false;
        }
    }
    if (!ok) {
        throw new AppError('Environment variables check failed', 'ENV_CHECK_FAILED');
    }
}

/**
 * Checks if the current working directory is the root of a git repository.
 */
async function checkWeAreInGitRepo() {
    const stats = await getFileStats('.git');
    if (!stats?.isDirectory()) {
        throw new AppError('Error: This script must be run at the git repository root.');
    }
}

/**
 *
 * @param {string | URL} filePath
 * @returns {Promise<Stats | undefined>}
 */
async function getFileStats(filePath) {
    try {
        const stats = await fs.stat(filePath);
        return stats;
    } catch {
        return undefined;
    }
}

/**
 * @param {ReleaseData} releaseData
 * @return {Promise<void>}
 */
async function updateVersionFile(releaseData) {
    const { tag, name, version } = releaseData;
    await fs.writeFile('release.json', JSON.stringify({ name, version, tag }, undefined, 4) + '\n', 'utf8');
}

const usage = `\
Usage: gen-release [options]
Options:
  -h, --help               Show this help message
  -t, --tag <tag>          Release tag (required if not set in env)
  -b, --body <body>        Release body (required if not set in env)
  -n, --name <name>        Release name (required if not set in env)
  -v, --version <version>  Release version (required if not set in env)
  -d, --debug              Enable debug mode
`;

/**
 *
 * @param {ReleaseData} releaseData
 * @returns
 */
function injectReleaseData(releaseData) {
    const notes = buildReleaseNotes(releaseData);

    /**
     *
     * @param {Root} tree
     * @returns {Root}
     */
    function inject(tree) {
        visit(tree, (node, index, parent) => {
            // Find the first top-level heading (depth 2)
            // Add the release notes before it.
            if (index && node.type === 'heading' && node.depth === 2 && parent?.type === 'root') {
                // Inject the release notes after the first top-level heading
                parent.children.splice(index, 0, ...notes.children);
                return false; // Stop visiting further nodes
            }
        });
        return tree;
    }

    return inject;
}

/**
 *
 * @param {ReleaseData} releaseData
 * @returns {Root}
 */
function buildReleaseNotes(releaseData) {
    const injectNodes = remark().use(remarkGfm).parse(releaseData.body);
    const increaseDepth = transformerIncreaseHeadings();
    const date = new Date().toISOString().split('T')[0];
    increaseDepth(injectNodes);
    /** @type {Heading} */
    const heading = {
        type: 'heading',
        depth: 2,
        children: [
            {
                type: 'text',
                value: `${releaseData.name} (${date})`,
            },
        ],
    };
    injectNodes.children.unshift(heading);

    return injectNodes;
}

/**
 *
 * @param {Root} tree
 */
function increaseHeadingDepth(tree) {
    let detailDepth = 0;
    visit(tree, (node, _index, _parent) => {
        // console.log('%s', `${_index}. Visiting node: ${node.type}`);
        if (node.type === 'html') {
            if (node.value.includes('<details>')) {
                detailDepth++;
            }
            if (node.value.includes('</details>')) {
                detailDepth--;
            }
        }
        if (node.type !== 'heading') return;
        if (detailDepth === 0) {
            node.depth++;
        }
    });
}

function transformerIncreaseHeadings() {
    /**
     * @param {Root} tree
     */
    return increaseHeadingDepth;
}

/**
 *
 * @param {string} content
 * @param {ReleaseData} releaseData
 * @returns {Promise<string>}
 */
async function processChangeLogContent(content, releaseData) {
    const result = await remark()
        .use(remarkGfm)
        .use(injectReleaseData, releaseData)
        .data('settings', {
            bullet: '-',
            bulletOrdered: '.',
            emphasis: '_',
            strong: '*',
            incrementListMarker: false,
        })
        .process(content);

    const resultString = String(result).replaceAll(/^[*]{3}$/gm, '---');

    return resultString;
}

/**
 *
 * @param {URL} url
 * @param {ReleaseData} releaseData
 * @returns
 */
async function processChangeLog(url, releaseData) {
    const urlOut = releaseData.debug ? new URL('CHANGELOG-1.md', url) : url;
    const content = await fs.readFile(url, 'utf8');

    const updatedChangeLog = await processChangeLogContent(content, releaseData);

    await fs.writeFile(urlOut, updatedChangeLog, 'utf8');
}

async function processRelease() {
    console.error('Generating release data...');

    const args = parseArgs({
        args: process.argv.slice(2),
        allowPositionals: true,
        options: {
            help: { type: 'boolean', short: 'h' },
            tag: { type: 'string', short: 't' },
            body: { type: 'string', short: 'b' },
            name: { type: 'string', short: 'n' },
            version: { type: 'string', short: 'v' },
            debug: { type: 'boolean', short: 'd' },
        },
    });

    if (args.values.help) {
        console.error('%s', usage);
        return;
    }

    await checkWeAreInGitRepo();

    const releaseData = {
        tag: args.values.tag ?? process.env.GITHUB_RELEASE_TAG,
        body: args.values.body ?? process.env.GITHUB_RELEASE_BODY,
        name: args.values.name ?? process.env.GITHUB_RELEASE_NAME,
        version: args.values.version ?? process.env.GITHUB_RELEASE_VERSION,
        debug: args.values.debug ?? false,
    };

    checkArgs(releaseData);

    await updateVersionFile(releaseData);

    const files = args.positionals.length > 0 ? args.positionals : ['CHANGELOG.md'];

    for (const file of files) {
        const url = pathToFileURL(file);
        await processChangeLog(url, releaseData);
    }
}

async function run() {
    try {
        await processRelease();
    } catch (error) {
        if (error instanceof AppError) {
            console.error(`AppError: \n  ${error.message}`);
        } else {
            console.error('Unexpected error:', error);
        }
        process.exitCode = 1;
    }
}

run();

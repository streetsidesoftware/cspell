// @ts-check

import fs from 'node:fs/promises';

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';

/**
 * @import { Node, Root, Heading, Text } from 'mdast';
 * @import { Stats } from 'node:fs';
 */

/**
 * @typedef {{ tag: string; body: string; name: string; version: string; date: string; debug?: boolean }} ReleaseData
 */

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
 * Checks if the current working directory is the root of a git repository.
 */
export async function checkWeAreInGitRepo() {
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
export async function getFileStats(filePath) {
    try {
        const stats = await fs.stat(filePath);
        return stats;
    } catch {
        return undefined;
    }
}

/**
 *
 * @param {ReleaseData} releaseData
 * @returns {Root}
 */
function buildReleaseNotesRoot(releaseData) {
    const injectNodes = remark().use(remarkGfm).parse(releaseData.body.replaceAll('\r\n', '\n'));
    const increaseDepth = transformerIncreaseHeadings();
    const date = releaseData.date;
    const name = releaseData.tag !== releaseData.name ? ` -- ${releaseData.name}` : '';
    const headingText = `${releaseData.tag} (${date})${name}`;
    increaseDepth(injectNodes);
    /** @type {Heading} */
    const heading = {
        type: 'heading',
        depth: 2,
        children: [{ type: 'text', value: headingText }],
    };
    injectNodes.children.unshift(heading);

    return injectNodes;
}

/**
 *
 * @param {ReleaseData} releaseData
 * @returns {string}
 */
function buildReleaseNotes(releaseData) {
    const root = buildReleaseNotesRoot(releaseData);
    // Convert the MDAST to a string
    const result = remark()
        .data('settings', {
            bullet: '-',
            bulletOrdered: '.',
            emphasis: '_',
            strong: '*',
            incrementListMarker: true,
        })
        .stringify(root)
        .replaceAll(/^[*]{3}$/gm, '---');
    return result.replace(/\n*$/, '\n\n');
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

const regexReleaseNotesHeader = /^##\s+(v?\d+\.\d+\.\d+)\s+\([-\d]+\).*$/gm;

/**
 *
 * @param {string} tag
 * @returns {RegExp}
 */
function regexForTag(tag) {
    const regexReleaseNotesHeaderTag = /^##\s+(tag)\s+\([-\d]+\).*$/gm;
    const rTag = escapeRegExp(tag).replace('v', 'v?');
    const r = regexReleaseNotesHeaderTag.source.replace('tag', rTag);
    return new RegExp(r, 'gm');
}

/**
 *
 * @param {string} content
 * @param {string} tag
 * @returns {{ tag: string, index: number } | undefined}
 */
function findReleaseNotesHeaderByTag(content, tag) {
    const regex = regexForTag(tag);
    const match = regex.exec(content);
    if (!match) return undefined;
    const index = match.index;
    return { tag, index };
}

/**
 *
 * @param {string} content
 * @param {number} [fromOffset]
 * @returns {{ tag: string, index: number } | undefined}
 */
function findReleaseNotesHeader(content, fromOffset = 0) {
    const regex = new RegExp(regexReleaseNotesHeader);
    regex.lastIndex = fromOffset;
    const match = regex.exec(content);
    if (!match) return undefined;
    const index = match.index;
    return { tag: match[1], index };
}

const fileHeader = `\
# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

`;

/**
 *
 * @param {string} content
 * @param {ReleaseData} releaseData
 * @return {{ content: string, index: number }}
 */
function determineContentInjectionPoint(content, releaseData) {
    const findTagHeader = findReleaseNotesHeaderByTag(content, releaseData.tag);
    if (findTagHeader) {
        const index = findTagHeader.index;
        const nextHeader = findReleaseNotesHeader(content, index + 1);
        const stopIndex = nextHeader?.index ?? content.length;
        content = content.slice(0, index) + content.slice(stopIndex);
        return { content, index };
    }

    const foundHeader = findReleaseNotesHeader(content);
    return { content, index: foundHeader?.index || 0 };
}

/**
 *
 * @param {string} content
 * @param {ReleaseData} releaseData
 * @returns {string}
 */
export function processChangeLogContent(content, releaseData) {
    let notes = buildReleaseNotes(releaseData);

    // Find the first top-level heading (depth 2)
    // Check if it is duplicated, if so, remove it.
    // and add the release notes before it.

    const { content: newContent, index } = determineContentInjectionPoint(content, releaseData);

    if (!index) {
        // If no header found, prepend the file header
        notes = fileHeader + notes;
    }

    return newContent.slice(0, index) + notes + newContent.slice(index);
}

/**
 *
 * @param {URL} url
 * @param {ReleaseData} releaseData
 * @returns
 */
export async function processChangeLog(url, releaseData) {
    const urlOut = releaseData.debug ? new URL('CHANGELOG-1.md', url) : url;
    const content = await fs.readFile(url, 'utf8');

    const updatedChangeLog = processChangeLogContent(content, releaseData);

    await fs.writeFile(urlOut, updatedChangeLog, 'utf8');
}

/**
 *
 * @param {string} s
 * @returns {string}
 */
export function escapeRegExp(s) {
    return s.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&').replaceAll('-', '\\x2d');
}

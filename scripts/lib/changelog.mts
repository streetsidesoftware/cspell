import type { Stats } from 'node:fs';
import fs from 'node:fs/promises';

import type { Heading, Root } from 'mdast';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';

export interface ReleaseData {
    /** The release tag, e.g., 'v1.2.3' */
    tag: string;
    /** The release notes body in Markdown format. */
    body: string;
    /** The name of the release. */
    name: string;
    /** The version of the release, e.g., '1.2.3'. */
    version: string;
    /** The release date in 'YYYY-MM-DD' format. */
    date: string;
    /** Whether to summarize the release notes. */
    summarize?: boolean;
    /** Whether to enable debug mode. */
    debug?: boolean;
    /** The URL of the repository. */
    repoUrl: URL;
    /** The base URL of the REST API. */
    apiUrl: URL;
}

class AppError extends Error {
    code: string | undefined;

    constructor(message: string, code?: string) {
        super(message);
        this.name = 'AppError';
        this.code = code;
    }
}

// cspell:ignore mdast

/**
 * Checks if the current working directory is the root of a git repository.
 */
export async function checkWeAreInGitRepo(): Promise<void> {
    const stats = await getFileStats('.git');
    if (!stats?.isDirectory()) {
        throw new AppError('Error: This script must be run at the git repository root.');
    }
}

export async function getFileStats(filePath: string | URL): Promise<Stats | undefined> {
    try {
        const stats = await fs.stat(filePath);
        return stats;
    } catch {
        return undefined;
    }
}

function buildReleaseNotesRoot(releaseData: ReleaseData): Root {
    const injectNodes = remark().use(remarkGfm).parse(releaseData.body.replaceAll('\r\n', '\n'));
    const increaseDepth = transformerIncreaseHeadings();
    const date = releaseData.date;
    const name = releaseData.tag !== releaseData.name ? ` -- ${releaseData.name}` : '';
    const headingText = `${releaseData.tag} (${date})${name}`;
    increaseDepth(injectNodes);
    fixPullRequestReferences(releaseData.repoUrl, injectNodes);
    const heading: Heading = {
        type: 'heading',
        depth: 2,
        children: [{ type: 'text', value: headingText }],
    };
    injectNodes.children.unshift(heading);

    return injectNodes;
}

function extractSummaryText(markdown: string): string {
    let startIndex = markdown.indexOf('<summary>');
    if (startIndex === -1) return '';
    startIndex += '<summary>'.length;
    const endIndex = markdown.indexOf('</summary>', startIndex);
    if (endIndex === -1) return '';
    return markdown.slice(startIndex, endIndex).trim();
}

/**
 * Summarize the release notes by replacing the <details> tags with the summary text.
 */
function summarizeReleaseNotes(markdown: string): string {
    let index = 0;
    let lastIndex = 0;
    let summary = '';
    for (index = markdown.indexOf('<details>'); index >= 0; index = markdown.indexOf('<details>', index)) {
        const endIndex = markdown.indexOf('</details>', index);
        if (endIndex < 0) break; // No closing tag found
        const prefix = markdown[index - 1] !== '\n' ? '\n' : '';
        summary = prefix + `- ${extractSummaryText(markdown.slice(index))}\n`;
        // Trim off any extra whitespace before the summary text
        const idx = markdown.slice(lastIndex, index).trim() ? index : lastIndex;
        markdown = markdown.slice(0, idx) + summary + markdown.slice(endIndex + '</details>'.length);
        index += summary.length; // Move index to the end of the summary text
        lastIndex = index;
    }
    return markdown;
}

export function buildReleaseNotes(releaseData: ReleaseData): string {
    const root = buildReleaseNotesRoot(releaseData);
    // Convert the MDAST to a string
    let result = remark()
        .data('settings', {
            bullet: '-',
            bulletOrdered: '.',
            emphasis: '_',
            strong: '*',
            incrementListMarker: true,
        })
        .stringify(root)
        .replaceAll(/^[*]{3}$/gm, '---');
    result = fixPullRequestReferencesMarkdown(releaseData.repoUrl, result);
    result = result.replace(/\n*$/, '\n\n');
    if (releaseData.summarize) {
        result = summarizeReleaseNotes(result);
    }
    result = result.replaceAll(/\n{3,}/g, '\n\n');
    return result;
}

function increaseHeadingDepth(tree: Root): void {
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

function prNumberToAnchor(urlRepo: URL, prNumber: string): string {
    if (!/^#\d+$/.test(prNumber)) {
        throw new AppError(`Invalid pull request number: ${prNumber}`);
    }
    const url = new URL(`pull/${prNumber.slice(1)}`, urlRepo);
    return `<a href="${url.href}">${prNumber}</a>`;
}

function prNumberToMarkdownLink(urlRepo: URL, prNumber: string): string {
    if (!/^#\d+$/.test(prNumber)) {
        throw new AppError(`Invalid pull request number: ${prNumber}`);
    }
    const url = new URL(`pull/${prNumber.slice(1)}`, urlRepo);
    return `[${prNumber}](${url.href})`;
}

function fixPullRequestReferencesMarkdown(urlRepo: URL, markdown: string): string {
    const value = markdown.replaceAll(
        /\((#\d+)\)/g,
        (match) => `(${prNumberToMarkdownLink(urlRepo, match.slice(1, -1))})`,
    );
    return value;
}

function fixPullRequestReferences(urlRepo: URL, tree: Root): void {
    visit(tree, (node, _index, _parent) => {
        // console.log('%s', `${_index}. Visiting node: ${node.type}`);
        if (node.type === 'html') {
            const value = node.value.replaceAll(
                /\((#\d+)\)/g,
                (match) => `(${prNumberToAnchor(urlRepo, match.slice(1, -1))})`,
            );
            // console.log('Found HTML node: %s -> %s', node.value, value);
            node.value = value;
            return;
        }
    });
}

function transformerIncreaseHeadings() {
    return increaseHeadingDepth;
}

const regexReleaseNotesHeader = /^##\s+(v?\d+\.\d+\.\d+)\s+\([-\d]+\).*$/gm;

function regexForTag(tag: string): RegExp {
    const regexReleaseNotesHeaderTag = /^##\s+(tag)\s+\([-\d]+\).*$/gm;
    const rTag = escapeRegExp(tag).replace('v', 'v?');
    const r = regexReleaseNotesHeaderTag.source.replace('tag', rTag);
    return new RegExp(r, 'gm');
}

interface ReleaseNotesHeader {
    tag: string;
    index: number;
}

function findReleaseNotesHeaderByTag(content: string, tag: string): ReleaseNotesHeader | undefined {
    const regex = regexForTag(tag);
    const match = regex.exec(content);
    if (!match) return undefined;
    const index = match.index;
    return { tag, index };
}

function findReleaseNotesHeader(content: string, fromOffset: number = 0): ReleaseNotesHeader | undefined {
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

interface ContentInjectionPoint {
    content: string;
    index: number;
}

function determineContentInjectionPoint(content: string, releaseData: ReleaseData): ContentInjectionPoint {
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

export function processChangeLogContent(content: string, releaseData: ReleaseData): string {
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

export async function processChangeLog(url: URL, releaseData: ReleaseData): Promise<void> {
    const urlOut = releaseData.debug ? new URL('CHANGELOG-1.md', url) : url;
    const content = await fs.readFile(url, 'utf8');

    const updatedChangeLog = processChangeLogContent(content, releaseData);

    await fs.writeFile(urlOut, updatedChangeLog, 'utf8');
}

export function escapeRegExp(s: string): string {
    return s.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&').replaceAll('-', '\\x2d');
}

import type { ErrorLike, Issue } from '@cspell/cspell-types';
import { IssueType } from '@cspell/cspell-types';

import { escapeXmlAttribute, escapeXmlText } from './escapeXml.js';

/**
 * A single file that was checked by cspell.
 *
 * Maps to one `<testsuite>` element. Each spelling {@link Issue} found in the
 * file maps to one `<testcase>` containing a `<failure>`. A file with no
 * issues is reported as a single passing `<testcase>` so the suite is never
 * empty (this mirrors the convention used by other JUnit reporters, e.g. the
 * ESLint JUnit formatter).
 */
export interface FileReport {
    /** File name/uri as reported by cspell. */
    filename: string;
    /** Spelling issues found in the file. */
    issues: Issue[];
    /** Time, in milliseconds, spent processing the file (if known). */
    elapsedTimeMs?: number | undefined;
    /** `false` if the file was skipped (not processed). */
    processed?: boolean | undefined;
    /** Reason the file was skipped, if applicable. */
    skippedReason?: string | undefined;
}

/**
 * A processing error reported by cspell that is not tied to a specific
 * spelling issue (e.g. a bad config file or an unreadable file).
 */
export interface ErrorReport {
    message: string;
    error: ErrorLike;
}

export interface JUnitXmlOptions {
    /** Name for the root `<testsuites>` element. */
    suiteName: string;
}

function formatTime(ms: number | undefined): string {
    return ((ms ?? 0) / 1000).toFixed(3);
}

function issueName(issue: Issue): string {
    const location = `${issue.row}:${issue.col}`;
    return `${issue.text} (${location})`;
}

function issueMessage(issue: Issue): string {
    if (issue.message) return issue.message;
    return `Unknown word: "${issue.text}"`;
}

function buildTestCaseForIssue(filename: string, issue: Issue): string {
    const name = escapeXmlAttribute(issueName(issue));
    const classname = escapeXmlAttribute(filename);
    const failureType = escapeXmlAttribute(issue.issueType === IssueType.directive ? 'directive' : 'spelling');
    const message = escapeXmlAttribute(issueMessage(issue));
    const body = escapeXmlText(issueMessage(issue));

    return (
        `    <testcase name="${name}" classname="${classname}">\n` +
        `      <failure type="${failureType}" message="${message}">${body}</failure>\n` +
        `    </testcase>\n`
    );
}

function buildPassingTestCase(filename: string): string {
    const classname = escapeXmlAttribute(filename);
    return `    <testcase name="no issues found" classname="${classname}"/>\n`;
}

function buildSkippedTestCase(filename: string, reason: string | undefined): string {
    const classname = escapeXmlAttribute(filename);
    const message = reason ? ` message="${escapeXmlAttribute(reason)}"` : '';
    return `    <testcase name="skipped" classname="${classname}">\n      <skipped${message}/>\n    </testcase>\n`;
}

function buildTestSuiteForFile(file: FileReport): string {
    const name = escapeXmlAttribute(file.filename);
    const time = formatTime(file.elapsedTimeMs);

    let testCases: string;
    let tests: number;
    let failures: number;

    if (file.processed === false) {
        testCases = buildSkippedTestCase(file.filename, file.skippedReason);
        tests = 1;
        failures = 0;
    } else if (file.issues.length) {
        testCases = file.issues.map((issue) => buildTestCaseForIssue(file.filename, issue)).join('');
        tests = file.issues.length;
        failures = file.issues.length;
    } else {
        testCases = buildPassingTestCase(file.filename);
        tests = 1;
        failures = 0;
    }

    return (
        `  <testsuite name="${name}" tests="${tests}" failures="${failures}" errors="0" time="${time}">\n` +
        testCases +
        `  </testsuite>\n`
    );
}

function buildTestSuiteForErrors(errors: ErrorReport[]): string {
    const testCases = errors
        .map(({ message, error }) => {
            const name = escapeXmlAttribute(message);
            const errorMessage = escapeXmlAttribute(error.message);
            const body = escapeXmlText(error.message);
            return (
                `    <testcase name="${name}" classname="cspell">\n` +
                `      <error type="error" message="${errorMessage}">${body}</error>\n` +
                `    </testcase>\n`
            );
        })
        .join('');

    return (
        `  <testsuite name="cspell-errors" tests="${errors.length}" failures="0" errors="${errors.length}" time="0.000">\n` +
        testCases +
        `  </testsuite>\n`
    );
}

/**
 * Builds a JUnit compatible XML document from the results of a cspell run.
 *
 * Mapping:
 * - one `<testsuites>` root for the whole run
 * - one `<testsuite>` per file checked
 * - one `<testcase>` per spelling issue found in a file, containing a `<failure>`
 * - a single passing `<testcase>` for files with no issues
 * - processing errors (not tied to a spelling issue) are reported in a
 *   dedicated `cspell-errors` testsuite using `<error>` instead of `<failure>`
 */
export function buildJUnitXml(files: FileReport[], errors: ErrorReport[], options: JUnitXmlOptions): string {
    const suiteName = escapeXmlAttribute(options.suiteName);

    const fileSuites = files.map(buildTestSuiteForFile);
    const errorSuite = errors.length ? [buildTestSuiteForErrors(errors)] : [];
    const suites = [...fileSuites, ...errorSuite];

    const totalTests = files.reduce((sum, file) => sum + Math.max(file.issues.length, 1), 0) + errors.length;
    const totalFailures = files.reduce((sum, file) => sum + file.issues.length, 0);
    const totalErrors = errors.length;
    const totalTime = files.reduce((sum, file) => sum + (file.elapsedTimeMs ?? 0), 0) / 1000;

    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        `<testsuites name="${suiteName}" tests="${totalTests}" failures="${totalFailures}" errors="${totalErrors}" time="${totalTime.toFixed(3)}">\n` +
        suites.join('') +
        '</testsuites>\n'
    );
}

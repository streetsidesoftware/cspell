import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import type { CSpellReporter, Issue, ReporterConfiguration } from '@cspell/cspell-types';
import { MessageTypes } from '@cspell/cspell-types';

import type { CSpellJSONReporterOutput } from './CSpellJSONReporterOutput.js';
import type { CSpellJSONReporterSettings } from './CSpellJSONReporterSettings.js';
import { setToJSONReplacer } from './utils/setToJSONReplacer.js';
import { validateSettings } from './utils/validateSettings.js';

function mkdirp(p: string) {
    return fs.mkdir(p, { recursive: true });
}

const noopReporter = () => undefined;

type ReporterConsole = Pick<Console, 'log' | 'warn' | 'error'>;

export interface CSpellJSONReporterConfiguration extends ReporterConfiguration {
    console?: ReporterConsole;
}

const STDOUT = 'stdout';
const STDERR = 'stderr';

type Data = Omit<CSpellJSONReporterOutput, 'result'>;

const _console = console;

function cleanIssue(issue: Issue): Issue {
    // Remove properties that are not needed in the output.
    const { hasPreferredSuggestions, hasSimpleSuggestions, context, ...rest } = issue;
    const cleaned: Issue = rest;
    if (hasPreferredSuggestions) {
        cleaned.hasPreferredSuggestions = hasPreferredSuggestions;
    }
    if (hasSimpleSuggestions) {
        cleaned.hasSimpleSuggestions = hasSimpleSuggestions;
    }
    cleaned.context = context || issue.line;
    return cleaned;
}

export function getReporter(
    settings: unknown | CSpellJSONReporterSettings,
    cliOptions?: CSpellJSONReporterConfiguration,
): Required<CSpellReporter> {
    const useSettings = normalizeSettings(settings);
    const reportData: Data = { issues: [], info: [], debug: [], error: [], progress: [] };
    const console = cliOptions?.console ?? _console;
    return {
        issue: (issue) => {
            reportData.issues.push(cleanIssue(issue));
        },
        info: (message, msgType) => {
            if (msgType === MessageTypes.Debug && !useSettings.debug) {
                return;
            }
            if (msgType === MessageTypes.Info && !useSettings.verbose) {
                return;
            }
            reportData.info = push(reportData.info, { message, msgType });
        },
        debug: useSettings.debug
            ? (message) => {
                  reportData.debug = push(reportData.debug, { message });
              }
            : noopReporter,
        error: (message, error) => {
            reportData.error = push(reportData.error, { message, error });
        },
        progress: useSettings.progress
            ? (item) => {
                  reportData.progress = push(reportData.progress, item);
              }
            : noopReporter,
        result: async (result) => {
            const outFile = useSettings.outFile || STDOUT;
            const output = {
                ...reportData,
                result,
            };
            const jsonData = JSON.stringify(output, setToJSONReplacer, 4);
            if (outFile === STDOUT) {
                console.log(jsonData);
                return;
            }
            if (outFile === STDERR) {
                console.error(jsonData);
                return;
            }
            const outFilePath = path.join(cliOptions?.root ?? process.cwd(), outFile);
            await mkdirp(path.dirname(outFilePath));
            return fs.writeFile(outFilePath, jsonData);
        },
        features: undefined,
    };
}

function normalizeSettings(settings: unknown | CSpellJSONReporterSettings): CSpellJSONReporterSettings {
    if (settings === undefined) return { outFile: STDOUT };
    validateSettings(settings);
    return settings;
}

function push<T>(src: T[] | undefined, value: T): T[] {
    if (src) {
        src.push(value);
        return src;
    }
    return [value];
}

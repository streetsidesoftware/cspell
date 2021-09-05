import * as fs from 'fs/promises';
import * as path from 'path';

import { CSpellReporter, MessageTypes } from '@cspell/cspell-types';
import { validateSettings } from './utils/validateSettings';
import { setToJSONReplacer } from './utils/setToJSONReplacer';
import { CSpellJSONReporterOutput } from './CSpellJSONReporterOutput';

const noopReporter = () => undefined;

export function getReporter(settings: unknown): CSpellReporter {
    validateSettings(settings);
    const reportData: Omit<CSpellJSONReporterOutput, 'result'> = {
        issue: [],
        info: [],
        debug: [],
        error: [],
        progress: [],
    };
    return {
        issue: (issue) => reportData.issue.push(issue),
        info: (message, msgType) => {
            if (msgType === MessageTypes.Debug && !settings.debug) {
                return;
            }
            if (msgType === MessageTypes.Info && !settings.verbose) {
                return;
            }
            reportData.info.push({ message, msgType });
        },
        debug: settings.debug ? (message) => reportData.debug.push({ message }) : noopReporter,
        error: (message, error) => reportData.error.push({ message, error }),
        progress: settings.progress ? (item) => reportData.progress.push(item) : noopReporter,
        result: (result) => {
            const outFilePath = path.join(process.cwd(), settings.outFile);
            const output = {
                ...reportData,
                result,
            };
            return fs.writeFile(outFilePath, JSON.stringify(output, setToJSONReplacer, 4));
        },
    };
}

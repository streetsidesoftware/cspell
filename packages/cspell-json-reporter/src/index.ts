import type { CSpellReporter } from '@cspell/cspell-types';
import { MessageTypes } from '@cspell/cspell-types';
import { promises as fs } from 'fs';
import mkdirp from 'mkdirp';
import * as path from 'path';
import type { CSpellJSONReporterOutput } from './CSpellJSONReporterOutput';
import type { CSpellJSONReporterSettings } from './CSpellJSONReporterSettings';
import { setToJSONReplacer } from './utils/setToJSONReplacer';
import { validateSettings } from './utils/validateSettings';

const noopReporter = () => undefined;

export function getReporter(settings: unknown | CSpellJSONReporterSettings): CSpellReporter {
    validateSettings(settings);
    const reportData: Omit<CSpellJSONReporterOutput, 'result'> = {
        issues: [],
        info: [],
        debug: [],
        error: [],
        progress: [],
    };
    return {
        issue: (issue) => {
            reportData.issues.push(issue);
        },
        info: (message, msgType) => {
            if (msgType === MessageTypes.Debug && !settings.debug) {
                return;
            }
            if (msgType === MessageTypes.Info && !settings.verbose) {
                return;
            }
            reportData.info.push({ message, msgType });
        },
        debug: settings.debug
            ? (message) => {
                  reportData.debug.push({ message });
              }
            : noopReporter,
        error: (message, error) => {
            reportData.error.push({ message, error });
        },
        progress: settings.progress
            ? (item) => {
                  reportData.progress.push(item);
              }
            : noopReporter,
        result: async (result) => {
            const outFilePath = path.join(process.cwd(), settings.outFile);
            const output = {
                ...reportData,
                result,
            };
            await mkdirp(path.dirname(outFilePath));
            return fs.writeFile(outFilePath, JSON.stringify(output, setToJSONReplacer, 4));
        },
    };
}

import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import type { CSpellReporter, ErrorLike, Issue, ProgressItem, ReporterConfiguration } from '@cspell/cspell-types';

import type { CSpellJUnitReporterSettings } from './CSpellJUnitReporterSettings.js';
import type { ErrorReport, FileReport } from './utils/buildJUnitXml.js';
import { buildJUnitXml } from './utils/buildJUnitXml.js';
import { validateSettings } from './utils/validateSettings.js';

function mkdirp(p: string) {
    return fs.mkdir(p, { recursive: true });
}

type ReporterConsole = Pick<Console, 'log' | 'warn' | 'error'>;

export interface CSpellJUnitReporterConfiguration extends ReporterConfiguration {
    console?: ReporterConsole;
}

const STDOUT = 'stdout';
const STDERR = 'stderr';

export function getReporter(
    settings: unknown | CSpellJUnitReporterSettings,
    cliOptions?: CSpellJUnitReporterConfiguration,
): Required<CSpellReporter> {
    const useSettings = normalizeSettings(settings);
    const console = cliOptions?.console ?? globalThis.console;

    const files = new Map<string, FileReport>();
    const errors: ErrorReport[] = [];
    const fileOrder: string[] = [];

    function getOrCreateFile(filename: string): FileReport {
        const existing = files.get(filename);
        if (existing) return existing;
        const created: FileReport = { filename, issues: [] };
        files.set(filename, created);
        fileOrder.push(filename);
        return created;
    }

    return {
        issue: (issue: Issue) => {
            const filename = issue.uri || '(unknown)';
            getOrCreateFile(filename).issues.push(issue);
        },
        info: () => undefined,
        debug: () => undefined,
        error: (message: string, error: ErrorLike) => {
            errors.push({ message, error });
        },
        progress: (item: ProgressItem) => {
            if (item.type !== 'ProgressFileComplete') return;
            const file = getOrCreateFile(item.filename);
            file.elapsedTimeMs = item.elapsedTimeMs;
            file.processed = item.processed;
            file.skippedReason = item.skippedReason;
        },
        result: async () => {
            const orderedFiles = fileOrder.map((filename) => files.get(filename)).filter((f): f is FileReport => !!f);
            const xml = buildJUnitXml(orderedFiles, errors, { suiteName: useSettings.suiteName || 'cspell' });

            const outFile = useSettings.outFile || STDOUT;
            if (outFile === STDOUT) {
                console.log(xml);
                return;
            }
            if (outFile === STDERR) {
                console.error(xml);
                return;
            }
            const outFilePath = path.join(cliOptions?.root ?? process.cwd(), outFile);
            await mkdirp(path.dirname(outFilePath));
            return fs.writeFile(outFilePath, xml);
        },
        features: undefined,
    };
}

function normalizeSettings(settings: unknown | CSpellJUnitReporterSettings): CSpellJUnitReporterSettings {
    if (settings === undefined) return { outFile: STDOUT, suiteName: 'cspell' };
    validateSettings(settings);
    return settings;
}

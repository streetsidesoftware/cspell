import type { Check, Options, RequiredOptions, WorkerOptions } from '../common/options';

export const defaultCheckOptions: Required<Check> = {
    checkComments: true,
    checkIdentifiers: true,
    checkJSXText: true,
    checkStrings: true,
    checkStringTemplates: true,
    customWords: [],
    customWordListFile: undefined,
    ignoreImportProperties: true,
    ignoreImports: true,
};

export const defaultOptions: RequiredOptions = {
    ...defaultCheckOptions,
    numSuggestions: 8,
    generateSuggestions: true,
    debugMode: false,
    autoFix: false,
};

export function normalizeOptions(opts: Options | undefined, cwd: string): WorkerOptions {
    const options: WorkerOptions = Object.assign({}, defaultOptions, opts || {}, { cwd });
    return options;
}

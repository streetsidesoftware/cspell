import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { resolve as r } from 'node:path';
import streamConsumers from 'node:stream/consumers';

import type { Issue, RunResult } from '@cspell/cspell-types';
import { afterEach, describe, expect, test, vi } from 'vitest';

import * as App from './application.mjs';
import type { LinterOptions, TraceOptions } from './options.js';
import { pathPackageRoot, pathSamples } from './test/test.helper.js';
import { asyncIterableToArray } from './util/async.js';
import { InMemoryReporter } from './util/InMemoryReporter.js';

const packageRoot = pathPackageRoot;
const samplesRoot = r(packageRoot, 'samples');
const fixturesRoot = r(packageRoot, 'fixtures');
const featuresRoot = r(fixturesRoot, 'features');
const tempRoot = r(packageRoot, 'temp');
const searchRoot = path.resolve(samplesRoot, 'config-search');

const sampleOptions = { root: samplesRoot };

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);
const ac = (...params: Parameters<typeof expect.arrayContaining>) => expect.arrayContaining(...params);

vi.mock('node:stream/consumers', () => ({ default: { text: vi.fn() } }));

const timeout = 10_000;

const testOptions = { timeout };

const j = path.join;

describe('Validate the Application', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    test('Tests running the application', testOptions, async () => {
        const files = ['text.txt'];
        const options = sampleOptions;
        const reporter = new InMemoryReporter();
        const lint = App.lint(files, options, reporter);
        const result = await lint;
        expect(reporter.errorCount).toBe(0);
        expect(reporter.infoCount).toBe(0); // verbose is off, no info messages.
        expect(reporter.debugCount).toBe(0);
        expect(reporter.runResult).toEqual(result);
        expect(result.files).toBe(1);
        return;
    });

    test('Tests running the application verbose', testOptions, async () => {
        const files = ['text.txt'];
        const options = { ...sampleOptions, verbose: true };
        const reporter = new InMemoryReporter();
        const lint = App.lint(files, options, reporter);
        const result = await lint;
        expect(reporter.errorCount).toBe(0);
        expect(reporter.infoCount).toBe(0); // verbose is off, no info messages.
        expect(reporter.debugCount).toBe(0);
        expect(reporter.runResult).toEqual(result);
        expect(result.files).toBe(1);
        return;
    });

    test('Tests running the application words only', testOptions, async () => {
        const files = ['text.txt'];
        const options = { ...sampleOptions, wordsOnly: true, unique: true };
        const reporter = new InMemoryReporter();
        const lint = App.lint(files, options, reporter);
        const result = await lint;
        expect(reporter.errorCount).toBe(0);
        expect(reporter.infoCount).toBe(0); // verbose is off, no info messages.
        expect(reporter.debugCount).toBe(0);
        expect(reporter.runResult).toEqual(result);
        expect(result.files).toBe(1);
        return;
    });

    test('Runs the application with stop config search at', testOptions, async () => {
        const files = ['index.txt'];

        const rootDir = j(searchRoot, 'stop-config-search', 'main');
        const stopSearchAt = j(searchRoot, 'stop-config-search');

        const options = {
            root: rootDir,
            stopConfigSearchAt: [stopSearchAt],
        };

        const reporter = new InMemoryReporter();
        const result = await App.lint(files, options, reporter);

        expect(reporter.errorCount).toBe(0);
        expect(reporter.infoCount).toBe(0); // verbose is off, no info messages.
        expect(reporter.debugCount).toBe(0);
        expect(reporter.runResult).toEqual(result);
        expect(result.files).toBe(1);
        expect(result.issues).toBe(0);
        return;
    });

    test('Stops config search at specified directory (no config found)', testOptions, async () => {
        const files = ['text.txt'];

        const rootDir = j(searchRoot, 'search-stop', 'src');
        const stopSearchAt = j(searchRoot, 'search-stop', 'src');

        const options = {
            root: rootDir,
            stopConfigSearchAt: [stopSearchAt],
            verbose: true,
            verboseLevel: 2,
        };

        const reporter = new InMemoryReporter();
        const result = await App.lint(files, options, reporter);

        expect(reporter.errorCount).toBe(0);
        expect(reporter.infoCount).toBeGreaterThan(0);
        expect(reporter.debugCount).toBe(0);
        expect(reporter.runResult).toEqual(result);
        expect(result.files).toBe(1);
        expect(result.issues).toBe(1);
        expect(reporter.log.some((line) => line.includes('Config Files Found') && line.includes('None found'))).toBe(
            true,
        );
        return;
    });

    test('limits config lookup using stopConfigSearchAt for each project', testOptions, async () => {
        const files = ['word.md'];
        const rootDir = j(searchRoot, 'repo', 'apps', 'src');

        const stopApps = j(searchRoot, 'repo', 'apps');
        const stopLibs = j(searchRoot, 'repo', 'libs');
        const stopConfigSearchAt = [stopApps, stopLibs];

        const options = {
            root: rootDir,
            stopConfigSearchAt,
            verbose: true,
            verboseLevel: 2,
        };

        const reporter = new InMemoryReporter();
        const result = await App.lint(files, options, reporter);

        expect(reporter.errorCount).toBe(0);
        expect(reporter.infoCount).toBeGreaterThan(0);
        expect(reporter.debugCount).toBe(0);
        expect(reporter.runResult).toEqual(result);
        expect(result.files).toBe(1);
        expect(result.issues).toBe(1);
        expect(reporter.log.some((line) => line.includes('Config Files Found') && line.includes('None found'))).toBe(
            true,
        );

        expect(reporter.issues[0].text).toBe('baddword'); // cspell:disable-line
        return;
    });

    test('Tests running the application with no config search', testOptions, async () => {
        const files = ['**/*.txt'];
        const config = j(searchRoot, 'cspell.temp.json');
        const searchOptions = { root: searchRoot };
        const options = { ...searchOptions, config, configSearch: false };
        const reporter = new InMemoryReporter();
        const lint = App.lint(files, options, reporter);
        const result = await lint;

        expect(reporter.errorCount).toBe(0);
        expect(reporter.infoCount).toBe(0); // verbose is off, no info messages.
        expect(reporter.debugCount).toBe(0);
        expect(reporter.runResult).toEqual(result);
        expect(result.files).toBe(3);
        expect(result.issues).toBe(3);
        return;
    });

    test('Tests running the trace command', testOptions, async () => {
        const result = await trace(['apple'], {});
        expect(result.length).toBeGreaterThan(2);

        const foundIn = result.filter((r) => r.found);
        expect(foundIn).toContainEqual(
            expect.objectContaining({
                dictName: 'en_us',
                dictSource: expect.stringContaining('en_US.trie.gz'),
            }),
        );
        expect(foundIn.map((d) => d.dictName)).toEqual(expect.arrayContaining(['en-gb', 'en_us', 'companies']));
    });

    test('Tests running the trace command with missing dictionary', testOptions, async () => {
        const result = await trace(['apple'], { config: 'samples/cspell-missing-dict.json' });
        expect(result.length).toBeGreaterThan(2);
        expect(result).toContainEqual(
            expect.objectContaining({
                dictName: 'missing-dictionary',
                dictSource: expect.stringContaining('missing.txt'),
            }),
        );
        const errors = result.filter((r) => r.errors).map((r) => r.errors);
        expect(errors).toContainEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    message: expect.stringContaining('failed to load'),
                }),
            ]),
        );
    });

    test('Tests checkText', testOptions, async () => {
        const result = await App.checkText('samples/latex/sample2.tex', {});
        expect(result.items.length).toBeGreaterThan(50);
        expect(result.items.map((i) => i.text).join('')).toBe(result.text);
    });

    test('running the application from stdin', testOptions, async () => {
        const files = ['stdin'];
        const options = { ...sampleOptions, wordsOnly: true, unique: true, debug: true, verbose: true, verboseLevel: 2 };
        const reporter = new InMemoryReporter();

        // cspell:ignore texxt
        const text = `
                This is some texxt to test out reding from stdin.
                cspell:ignore badspellingintext
                We can ignore values within the text: badspellingintext
            `;
        vi.mocked(streamConsumers.text).mockImplementation(async () => text);

        const lint = App.lint(files, options, reporter);
        const result = await lint;
        expect(result.files).toBe(1);
        expect(reporter.errorCount).toBe(0);
        expect(reporter.infoCount).toBeGreaterThan(0);
        expect(reporter.debugCount).toBeGreaterThan(0);
        expect(reporter.issues.map((i) => i.text)).toEqual(['texxt']);
        expect(reporter.runResult).toEqual(result);
    });
});

async function trace(words: string[], options: TraceOptions) {
    const results = await asyncIterableToArray(App.trace(words, options));
    return results.flat();
}

describe('Validate createInit', () => {
    test('createInit', async () => {
        async function worked() {
            try {
                await App.createInit({ output: 'temp/', format: 'yaml', locale: 'en-GB' });
            } catch {
                return false;
            }
            return true;
        }
        expect(await worked()).toBe(true);
    });
});

describe('Application, Validate Samples', () => {
    function iMap(issue: string | Partial<Issue>): Partial<Issue> {
        return expect.objectContaining(typeof issue === 'string' ? { text: issue } : issue);
    }

    sampleTests().map((sample) =>
        test(`Test file: "${sample.file}"`, async () => {
            const reporter = new InMemoryReporter();
            const root = path.resolve(path.dirname(sample.file));
            const { file, issues, options: sampleOptions = {} } = sample;
            const options = {
                root,
                ...sampleOptions,
            };

            const result = await App.lint([path.resolve(file)], options, reporter);
            expect(result.files).toBe(1);
            expect(reporter.issues).toEqual(issues.map(iMap));
            expect(result.issues).toBe(issues.length);
            expect(reporter.runResult).toEqual(result);
        }),
    );
});

describe('Linter File Caching', () => {
    function fr(path: string) {
        return r(featuresRoot, path);
    }

    interface Run {
        fileGlobs: string[];
        options: LinterOptions;
        expected: Partial<RunResult>;
    }

    interface TestCase {
        runs: Run[];
        root: string;
    }

    function run(fileGlobs: string[], options: LinterOptions, expected: Partial<RunResult>): Run {
        return { fileGlobs, options, expected };
    }

    function fc(files: number, cachedFiles: number): Partial<RunResult> {
        return { files, cachedFiles };
    }

    const NoCache: LinterOptions = { cache: false };
    const Config: LinterOptions = { cacheFormat: 'legacy' };
    const WithCacheL: LinterOptions = { cache: true, cacheStrategy: 'content', cacheFormat: 'legacy' };
    const WithCache: LinterOptions = { cache: true, cacheStrategy: 'content', cacheFormat: 'universal' };
    // const WithCacheUniversal: LinterOptions = { cache: true, cacheStrategy: 'metadata' };
    const WithCacheResetL: LinterOptions = {
        cache: true,
        cacheStrategy: 'content',
        cacheReset: true,
        cacheFormat: 'legacy',
    };
    const WithCacheReset: LinterOptions = {
        ...WithCacheResetL,
        cacheFormat: 'universal',
    };
    const CacheMetadata: LinterOptions = { cache: true, cacheStrategy: 'metadata', cacheFormat: 'legacy' };

    test.each`
        runs                                                                                                                              | root            | comment
        ${[run([], Config, fc(0, 0)), run([], Config, fc(0, 0))]}                                                                         | ${packageRoot}  | ${'No files'}
        ${[run(['*.md'], Config, fc(1, 0)), run(['*.md'], Config, fc(1, 1))]}                                                             | ${fr('cached')} | ${'Config based caching'}
        ${[run(['*.md'], NoCache, fc(1, 0)), run(['*.md'], WithCacheL, fc(1, 0)), run(['*.md'], WithCacheL, fc(1, 1))]}                   | ${fr('cached')} | ${'Single .md file not cached then cached, result is not cached.'}
        ${[run(['*.md'], WithCacheL, fc(1, 0)), run(['*.md'], WithCacheL, fc(1, 1)), run(['*.md'], WithCacheL, fc(1, 1))]}                | ${fr('cached')} | ${'Single .md file cached three runs'}
        ${[run(['*.md'], WithCacheL, fc(1, 0)), run(['*.{md,ts}'], WithCacheL, fc(2, 1)), run(['*.{md,ts}'], CacheMetadata, fc(2, 0))]}   | ${fr('cached')} | ${'with cache rebuild'}
        ${[run(['*.md'], WithCacheL, fc(1, 0)), run(['*.{md,ts}'], WithCacheL, fc(2, 1)), run(['*.{md,ts}'], WithCacheL, fc(2, 2))]}      | ${fr('cached')} | ${'cached changing glob three runs L WWW'}
        ${[run(['*.md'], WithCacheL, fc(1, 0)), run(['*.{md,ts}'], WithCacheL, fc(2, 1)), run(['*.{md,ts}'], WithCacheResetL, fc(2, 0))]} | ${fr('cached')} | ${'cached changing glob three runs L WWR'}
        ${[run(['*.md'], WithCacheL, fc(1, 0)), run(['*.{md,ts}'], WithCacheResetL, fc(2, 0)), run(['*.{md,ts}'], WithCacheL, fc(2, 2))]} | ${fr('cached')} | ${'cached changing glob three runs L WRW'}
        ${[run(['*.md'], WithCache, fc(1, 0)), run(['*.{md,ts}'], WithCache, fc(2, 1)), run(['*.{md,ts}'], WithCache, fc(2, 2))]}         | ${fr('cached')} | ${'cached changing glob three runs U WWW'}
        ${[run(['*.md'], WithCache, fc(1, 0)), run(['*.{md,ts}'], WithCache, fc(2, 1)), run(['*.{md,ts}'], WithCacheReset, fc(2, 0))]}    | ${fr('cached')} | ${'cached changing glob three runs U WWR'}
        ${[run(['*.md'], WithCache, fc(1, 0)), run(['*.{md,ts}'], WithCacheReset, fc(2, 0)), run(['*.{md,ts}'], WithCache, fc(2, 2))]}    | ${fr('cached')} | ${'cached changing glob three runs U WRW'}
    `('lint caching with $root $comment', async ({ runs, root }: TestCase) => {
        const reporter = new InMemoryReporter();
        const cacheLocation = tempLocation('.cspellcache');
        await fs.rm(cacheLocation, { recursive: true }).catch(() => undefined);

        let r = 0;

        for (const run of runs) {
            ++r;
            const { fileGlobs, options, expected } = run;
            const useOptions = { ...options, cacheLocation };
            useOptions.root = root;
            const result = await App.lint(fileGlobs, useOptions, reporter);
            expect(reporter.errors).toEqual([]);
            expect(result, `run #${r}`).toEqual(oc(expected));
        }
    });

    test.each`
        runs                                                                                                                      | root                   | comment
        ${[run(['*.ts'], WithCache, fc(1, 0)), run(['*.{md,ts}'], WithCache, fc(2, 1)), run(['*.{md,ts}'], WithCache, fc(2, 2))]} | ${fr('cached-remote')} | ${'cached changing glob three runs U WWW'}
    `('lint caching remote with $root $comment', { timeout: 60_000 }, async ({ runs, root }: TestCase) => {
        const reporter = new InMemoryReporter();
        const cacheLocation = tempLocation('.cspellcache');
        await fs.rm(cacheLocation, { recursive: true }).catch(() => undefined);

        let r = 0;

        for (const run of runs) {
            ++r;
            const { fileGlobs, options, expected } = run;
            const useOptions = { ...options, cacheLocation };
            useOptions.root = root;
            const result = await App.lint(fileGlobs, useOptions, reporter);
            expect(reporter.errors).toEqual([]);
            expect(result, `run #${r}`).toEqual(oc(expected));
        }
    });
});

let testCounter = 0;

function tempLocation(...parts: string[]): string {
    const currTestName = expect.getState().currentTestName || 'test';
    const testName =
        currTestName.replaceAll(/\W/g, '_') + performance.now().toFixed(2) + '-' + (++testCounter).toString();
    return r(tempRoot, testName, ...parts);
}

interface SampleTest {
    file: string;
    issues: (string | Partial<Issue>)[];
    options?: LinterOptions;
}

function sampleTests(): SampleTest[] {
    // cspell:disable
    return [
        {
            file: path.join(pathSamples, './src/drives.ps1'),
            issues: ['Woude', 'Woude'],
        },
        {
            file: path.join(pathPackageRoot, '../cspell-lib/samples/src/drives.ps1'),
            issues: ['Woude', 'Woude'],
        },
        { file: 'samples/src/drives.ps1', issues: ['Woude', 'Woude'] },
        { file: 'samples/src/sample.c', issues: [] },
        {
            file: 'samples/src/sample.go',
            options: { showSuggestions: true, showContext: true },
            issues: [
                { text: 'longname' },
                { text: 'longname' },
                {
                    text: 'garbbage',
                    suggestions: ac(['garbage', 'garage']),
                    context: oc({ text: 'Deliberate misspelling: garbbage. */' }),
                },
            ],
        },
        { file: 'samples/src/sample.py', issues: ['garbbage'] },
        {
            file: 'samples/src/sample.tex',
            issues: ['includegraphics', 'Zotero'],
        },
        {
            file: path.join(pathSamples, './src/drives.ps1'),
            issues: ['Woude', 'Woude'],
        },
        {
            file: path.join(pathPackageRoot, '../cspell-lib/samples/src/drives.ps1'),
            issues: ['Woude', 'Woude'],
        },
    ];
    // cspell:enable
}

import assert from 'node:assert';
import * as fs from 'node:fs';
import * as Path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Config, Repository } from './configDef.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const configLocation = Path.resolve(Path.join(__dirname, '..', 'config'));
const configFile = Path.join(configLocation, 'config.json');
const repoConfigs = 'config/repositories';
const pathRoot = '../../../..';
const pathRepoConfig = Path.join(pathRoot, repoConfigs);
const pathCommonRepoRoot = Path.join(pathRoot, 'repositories');
const pathCommonRepoCSpellConfig = Path.join(pathCommonRepoRoot, 'cspell.yaml');
const pathCommonRepoBase = Path.join(pathCommonRepoRoot, 'temp');
const pathReporter = Path.join(pathRoot, 'custom-reporter.js');
const pathReporterListAll = Path.join(pathRoot, 'custom-reporter-list-all.js');

const defaultConfig: Config = {
    repositories: [],
};

export function readConfig(): Config {
    try {
        const file = fs.readFileSync(configFile, 'utf8');
        const cfg = JSON.parse(file);
        return cfg;
    } catch {
        return JSON.parse(JSON.stringify(defaultConfig));
    }
}

function fixPlaceHolders(text: string, placeHolderReplacements: Record<string, string>): string {
    for (const [key, value] of Object.entries(placeHolderReplacements)) {
        assert(key.startsWith('${'), 'Placeholder must start with "${"');
        assert(key.endsWith('}'), 'Placeholder must end with "}"');
        text = text.replace(key, value);
    }

    assert(!text.includes('${'), `Still contains placeholder ${text}`);

    return text;
}

export function resolveRepArgs(rep: Repository): Repository {
    const args = resolveArgs(rep.path, rep.args);
    return { ...rep, args };
}

export function resolveArgs(repPath: string, args: string[]): string[] {
    const repoConfigLocation = Path.join(pathRepoConfig, repPath);

    const placeHolderReplacements = {
        '${repoConfig}': repoConfigLocation,
        '${commonRoot}': pathCommonRepoRoot,
        '${commonBase}': pathCommonRepoBase,
        '${commonConfig}': pathCommonRepoCSpellConfig,
        '${pathReporter}': pathReporter,
        '${pathReporterListAll}': pathReporterListAll,
        '${repoPath}': repPath,
    };

    return args.map((a) => fixPlaceHolders(a, placeHolderReplacements));
}

export function writeConfig(config: Config): void {
    fs.writeFileSync(configFile, JSON.stringify(config, undefined, 2) + '\n');
}

/**
 * Add / Update a Repository config entry
 * @param path - relative path on where to store the repo
 * @param url - github url of the repo
 * @param commit - commit id.
 */
export function addRepository(path: string, url: string, commit: string, branch: string | undefined): Repository {
    const config = readConfig();
    const entries = new Map<string, Repository>(config.repositories.map((r) => [r.path, r]));
    const existingEntry: Partial<Repository> = entries.get(path) || {};
    const args = existingEntry.args || ['**'];
    const postCheckoutSteps = existingEntry.postCheckoutSteps;

    const entry: Repository = {
        ...existingEntry,
        path,
        url,
        postCheckoutSteps,
        args,
        commit,
        branch,
    };

    entries.set(path, entry);
    config.repositories = [...entries.values()];
    writeConfig(config);
    return entry;
}

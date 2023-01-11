import * as fs from 'fs';
import * as Path from 'path';

import type { Config, Repository } from './configDef';

const configLocation = Path.resolve(Path.join(__dirname, '..', 'config'));
const configFile = Path.join(configLocation, 'config.json');
const repoConfigs = 'config/repositories';

const defaultConfig: Config = {
    repositories: [],
};

export function readConfig(): Config {
    try {
        const file = fs.readFileSync(configFile, 'utf-8');
        const cfg = JSON.parse(file);
        return cfg;
    } catch (e) {
        return JSON.parse(JSON.stringify(defaultConfig));
    }
}

export function resolveArgs(rep: Repository): Repository {
    const repoConfigLocation = Path.join('..', '..', '..', '..', repoConfigs, rep.path);
    const args = rep.args.map((a) => a.replace('${repoConfig}', repoConfigLocation));
    return { ...rep, args };
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

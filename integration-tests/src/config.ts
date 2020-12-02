import { Config, Repository } from './configDef';
import * as fs from 'fs';
import * as Path from 'path';

const configLocation = Path.resolve(Path.join(__dirname, '..', 'config'));
const configFile = Path.join(configLocation, 'config.json');
const repoConfigs = Path.join(configLocation, 'repositories');

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
    const repoConfigLocation = Path.join(repoConfigs, rep.path);
    const args = rep.args.map((a) => a.replace('${repoConfig}', repoConfigLocation));
    return { ...rep, args };
}

export function writeConfig(config: Config): void {
    fs.writeFileSync(configFile, JSON.stringify(config, undefined, 2));
}

export function addRepository(path: string, url: string, commit: string): void {
    const config = readConfig();
    const entries = new Map<string, Repository>(config.repositories.map((r) => [r.path, r]));
    const args = entries.get(path)?.args || ['**/*.*', '*.*'];
    const entry: Repository = {
        path,
        url,
        args,
        commit,
    };

    entries.set(path, entry);
    config.repositories = [...entries.values()];
    writeConfig(config);
}

import { Config, Repository } from './configDef';
import * as fs from 'fs';
import * as Path from 'path';

const configFile = Path.join(__dirname, '..', 'config', 'config.json');

const defaultConfig: Config = {
    repositories: [],
}

export function readConfig(): Config {
    try {
        const file = fs.readFileSync(configFile, 'utf-8');
        return JSON.parse(file);
    } catch (e) {
        return JSON.parse(JSON.stringify(defaultConfig));
    }
}

export function writeConfig(config: Config) {
    fs.writeFileSync(configFile, JSON.stringify(config, undefined, 2))
}

export function addRepository(path: string, url: string) {
    const config = readConfig();
    const entry: Repository = {
        path,
        url,
        args: ['**/*.*', '*.*']
    }

    const entries = new Map<string, Repository>(config.repositories.map(r => [r.path, r]));
    entries.set(path, entry);
    config.repositories = [...entries.values()];
    writeConfig(config);
}

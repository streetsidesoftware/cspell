import fs from 'node:fs/promises';
import path from 'node:path';

import { CSpellSettings } from '@cspell/cspell-types';
import envPaths from 'env-paths';
import { xdgConfig } from 'xdg-basedir';

import { isDefined } from '../util/util.js';

const packageName = 'cspell';

export const legacyLocationDir = xdgConfig ? path.join(xdgConfig, 'configstore') : undefined;
export const cspellGlobalLocationDir = envPaths(packageName, { suffix: '' }).config;

export const defaultConfigFileName = 'cspell.json';

const searchOrder = [cspellGlobalLocationDir, legacyLocationDir].filter(isDefined);

interface GlobalConfigFile {
    filename: string;
    config: CSpellSettings;
}
export class GlobalConfigStore {
    #foundLocation: string | undefined;
    #baseFilename: string;

    constructor(filename: string = defaultConfigFileName) {
        this.#baseFilename = filename;
    }

    async #readConfigFile(location: string): Promise<GlobalConfigFile | undefined> {
        try {
            const json = await fs.readFile(location, 'utf8');
            return { filename: location, config: JSON.parse(json) };
        } catch {
            return undefined;
        }
    }

    async readConfigFile(): Promise<GlobalConfigFile | undefined> {
        if (this.#foundLocation) {
            const found = await this.#readConfigFile(this.#foundLocation);
            if (found) return found;
        }
        const firstFile = path.resolve(cspellGlobalLocationDir, this.#baseFilename);
        const possibleLocations = new Set([
            firstFile,
            ...searchOrder.map((p) => path.resolve(p, defaultConfigFileName)),
        ]);

        for (const filename of possibleLocations) {
            const found = await this.#readConfigFile(filename);
            if (found) {
                this.#foundLocation = found.filename;
                return found;
            }
        }

        return undefined;
    }

    async writeConfigFile(cfg: CSpellSettings): Promise<string> {
        this.#foundLocation ??= path.join(cspellGlobalLocationDir, this.#baseFilename);
        await fs.mkdir(path.dirname(this.#foundLocation), { recursive: true });
        await fs.writeFile(this.#foundLocation, JSON.stringify(cfg, undefined, 2) + '\n');
        return this.#foundLocation;
    }

    get location(): string | undefined {
        return this.#foundLocation;
    }

    static create() {
        return new this();
    }

    static defaultLocation: string = path.join(cspellGlobalLocationDir, defaultConfigFileName);
}

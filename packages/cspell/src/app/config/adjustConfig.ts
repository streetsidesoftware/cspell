import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { CSpellSettings } from '@cspell/cspell-types';
import { toFileDirURL, urlRelative } from '@cspell/url';
import { CSpellConfigFile, isCfgArrayNode, MutableCSpellConfigFile } from 'cspell-config-lib';

import { toError } from '../util/errors.js';

async function fileExists(url: URL): Promise<boolean> {
    try {
        const stats = await fs.stat(url);
        return stats.isFile();
    } catch (e) {
        const err = toError(e);
        if (err.code === 'ENOENT') return false;
        throw e;
    }
}

export async function resolveImports(configFile: CSpellConfigFile, imports: string[]) {
    const fromConfigDir = new URL('./', configFile.url);
    const fromCurrentDir = toFileDirURL('./');
    const require = createRequire(fromConfigDir);

    function isPackageName(name: string): boolean {
        try {
            require.resolve(name, { paths: [fileURLToPath(fromConfigDir)] });
            return true;
        } catch {
            return false;
        }
    }

    const _imports: string[] = [];

    for (const imp of imports) {
        const url = new URL(imp, fromCurrentDir);
        if (url.protocol !== 'file:') {
            _imports.push(imp);
            continue;
        }
        if (await fileExists(url)) {
            let rel = urlRelative(fromConfigDir, url);
            if (!(rel.startsWith('./') || rel.startsWith('../'))) {
                rel = './' + rel; // Ensure relative path starts with './' or '../'
            }
            _imports.push(rel);
            continue;
        }
        if (isPackageName(imp)) {
            _imports.push(imp);
            continue;
        }
        throw new Error(`Cannot resolve import: ${imp}`);
    }

    return _imports;
}

function addImportsToMutableConfigFile(configFile: MutableCSpellConfigFile, resolvedImports: string[]) {
    let importNode = configFile.getNode('import', []);
    if (importNode.type === 'scalar') {
        configFile.setValue('import', [importNode.value]);
        importNode = configFile.getNode('import', []);
    }
    assert(isCfgArrayNode(importNode));
    const knownImports = new Set(importNode.value);
    for (const imp of resolvedImports) {
        if (knownImports.has(imp)) continue;
        importNode.push(imp);
    }
}

export async function addImportsToConfigFile(configFile: CSpellConfigFile, imports: string[]): Promise<void> {
    const resolvedImports = await resolveImports(configFile, imports);
    if (configFile instanceof MutableCSpellConfigFile) {
        return addImportsToMutableConfigFile(configFile, resolvedImports);
    }
    const settings = configFile.settings;
    let importNode = settings.import;
    if (!Array.isArray(importNode)) {
        importNode = typeof importNode === 'string' ? [importNode] : [];
        settings.import = importNode;
    }
    assert(Array.isArray(importNode));
    const knownImports = new Set(importNode);
    for (const imp of resolvedImports) {
        if (knownImports.has(imp)) continue;
        importNode.push(imp);
    }
}

export function setConfigFieldValue<K extends keyof CSpellSettings>(
    configFile: CSpellConfigFile,
    key: K,
    value: CSpellSettings[K],
): void {
    if (configFile instanceof MutableCSpellConfigFile) {
        configFile.setValue(key, value);
        return;
    }
    const settings = configFile.settings;
    settings[key] = value;
}

export function addDictionariesToConfigFile(configFile: CSpellConfigFile, dictionaries: string[]): void {
    if (configFile instanceof MutableCSpellConfigFile) {
        const dicts = configFile.getNode('dictionaries', []);
        assert(isCfgArrayNode(dicts));
        const knownDicts = new Set(dicts.value);
        for (const dict of dictionaries) {
            if (!knownDicts.has(dict)) {
                dicts.push(dict);
                knownDicts.add(dict);
            }
        }
        return;
    }
    const settings = configFile.settings;
    const dicts = settings.dictionaries || [];
    const knownDicts = new Set(dicts);
    for (const dict of dictionaries) {
        if (!knownDicts.has(dict)) {
            dicts.push(dict);
            knownDicts.add(dict);
        }
    }
    settings.dictionaries = dicts;
}

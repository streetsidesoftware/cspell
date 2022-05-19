import { Deserializer } from '../Deserializer';
import { ImplCSpellConfigFile } from '../CSpellConfigFile';
import { detectIndent } from './util';
import { CSpellSettings } from '@cspell/cspell-types';

const isPackageJsonFile = /package\.json(?=$|[?#])/;

function _deserializerPackageJson(uri: string, content: string): ImplCSpellConfigFile | undefined {
    if (!isPackageJsonFile.test(uri)) return undefined;

    const packageJson = JSON.parse(content);
    if (!packageJson || typeof packageJson !== 'object' || Array.isArray(packageJson)) {
        throw new Error(`Unable to parse ${uri}`);
    }
    packageJson['cspell'] = packageJson['cspell'] || {};
    const cspell = packageJson['cspell'];
    if (typeof cspell !== 'object' || Array.isArray(cspell)) {
        throw new Error(`Unable to parse ${uri}`);
    }

    const indent = detectIndent(content);

    function serialize(settings: CSpellSettings) {
        packageJson['cspell'] = settings;
        return JSON.stringify(packageJson, null, indent) + '\n';
    }

    return new ImplCSpellConfigFile(uri, cspell, serialize);
}

export const deserializerPackageJson: Deserializer = _deserializerPackageJson;

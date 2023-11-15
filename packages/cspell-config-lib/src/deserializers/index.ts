import type { Deserializer } from '../Deserializer.js';
import { deserializerCSpellJson } from './cspellJson.js';
import { deserializerCSpellYaml } from './cspellYaml.js';
import { deserializerPackageJson } from './packageJson.js';

export const defaultDeserializers: Deserializer[] = [
    deserializerPackageJson,
    deserializerCSpellJson,
    deserializerCSpellYaml,
];

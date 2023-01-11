import type { Deserializer } from '../Deserializer';
import { deserializerCSpellJson } from './cspellJson';
import { deserializerCSpellYaml } from './cspellYaml';
import { deserializerPackageJson } from './packageJson';

export const defaultDeserializers: Deserializer[] = [
    deserializerPackageJson,
    deserializerCSpellJson,
    deserializerCSpellYaml,
];

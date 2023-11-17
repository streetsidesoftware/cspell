import type { SerializerMiddleware } from '../Serializer.js';
import { serializerCSpellJson } from './cspellJson.js';
import { serializerCSpellYaml } from './cspellYaml.js';
import { serializerPackageJson } from './packageJson.js';

export const defaultDeserializers: SerializerMiddleware[] = [
    serializerCSpellJson,
    serializerCSpellYaml,
    serializerPackageJson,
];

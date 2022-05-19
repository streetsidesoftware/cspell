import { Deserializer } from '../Deserializer';
import { deserializerCSpellJson } from './cspellJson';
import { deserializerPackageJson } from './packageJson';

export const defaultDeserializers: Deserializer[] = [deserializerPackageJson, deserializerCSpellJson];

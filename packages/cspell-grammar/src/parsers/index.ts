import { parser as parserTypeScript } from './typescript/index.js';
import { parser as parserYaml } from './yaml/YamlParser.js';

export const parsers = [parserTypeScript, parserYaml];

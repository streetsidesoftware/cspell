import {Trie} from './trie';
import {importTrie} from './importExport';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as zlib from 'zlib';


export async function readTrieFile(configLocation: string): Promise<Trie> {
    const buffer = await fs.readFile(configLocation);
    const json = buffer.toString();
    const config = JSON.parse(json.replace(/\/\/.*/g, ''));
    const dictDef = config && config.dictionaryDefinitions && config.dictionaryDefinitions[0] || {};
    const dictPath = dictDef.file || '';
    const pathToDict = path.join(path.dirname(configLocation), dictPath);

    const trieFileContents = await fs.readFile(pathToDict)
        .then(buffer => zlib.gunzipSync(buffer))
        .then(buffer => buffer.toString('utf8'))
        ;

    const trieLines = trieFileContents.split('\n');
    const trieNode = importTrie(trieLines);
    return new Trie(trieNode);
}

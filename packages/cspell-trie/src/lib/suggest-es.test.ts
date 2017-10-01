import {expect} from 'chai';
import {Trie} from './trie';
import {importTrieRx} from './importExport';
import * as Rx from 'rxjs/Rx';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as zlib from 'zlib';
import * as cspellDict from 'cspell-dict-es-es';


let trie: Promise<Trie>;

function getTrie(): Promise<Trie> {
    if (!trie) {
        const configLocation = cspellDict.getConfigLocation();

        const config = fs.readFile(configLocation)
            .then(buffer => buffer.toString())
            .then(json => JSON.parse(json.replace(/\/\/.*/g, '')));

        const pathToDict = config.then(config => {
            const dictDef = config && config.dictionaryDefinitions && config.dictionaryDefinitions[0] || {};
            const dictPath = dictDef.file || '';
            return path.join(path.dirname(configLocation), dictPath);
        });

        const trieFileContents = pathToDict.then(pathToDict => fs.readFile(pathToDict))
            .then(buffer => zlib.gunzipSync(buffer))
            .then(buffer => buffer.toString('UTF-8'))
            ;

        const trieLines = Rx.Observable
            .fromPromise(trieFileContents.then(trieFileContents => trieFileContents.split('\n')))
            .flatMap(a => a);

        const trieNode = importTrieRx(trieLines).take(1).toPromise();

        trie = trieNode.then(node => new Trie(node));
    }
    return trie;
}

describe('Validate Spanish Suggestions', () => {
    it('Tests suggestions', () => {
        return getTrie().then(trie => {
            // cspell:ignore Carmjen
            const results = trie.suggestWithCost('carmjen', 10);
            // console.log(JSON.stringify(results));
            const suggestions = results.map(s => s.word);
            expect(suggestions).to.contain('carmen');
            expect(suggestions[0]).to.be.equal('carmen');
        });
    });
});


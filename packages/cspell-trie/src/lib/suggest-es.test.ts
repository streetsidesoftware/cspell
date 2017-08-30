import {expect} from 'chai';
import {Trie} from './trie';
import {importTrieRx} from './importExport';
import * as Rx from 'rxjs/Rx';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as zlib from 'zlib';

const pathToDict = path.dirname(require.resolve('cspell-dict-es-es'));
const trieFileContents = fs.readFile(path.join(pathToDict, 'Spanish.trie.gz'))
    .then(buffer => zlib.gunzipSync(buffer))
    .then(buffer => buffer.toString('UTF-8'))
    ;

const trieLines = Rx.Observable
    .fromPromise(trieFileContents.then(trieFileContents => trieFileContents.split('\n')))
    .flatMap(a => a);

const trieNode = importTrieRx(trieLines).take(1).toPromise();

const trie = trieNode.then(node => new Trie(node));

describe('Validate Spanish Suggestions', () => {
    it('Tests suggestions', () => {
        return trie.then(trie => {
            // cspell:ignore Carmjen
            const results = trie.suggestWithCost('carmjen', 10);
            // console.log(JSON.stringify(results));
            const suggestions = results.map(s => s.word);
            expect(suggestions).to.contain('carmen');
            expect(suggestions[0]).to.be.equal('carmen');
        });
    });
});


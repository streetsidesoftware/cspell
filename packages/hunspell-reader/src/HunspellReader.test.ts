import {expect} from 'chai';
import {HunspellReader} from './HunspellReader';
import * as Aff from './aff';

describe('HunspellReader En', function() {
    // We are read big files, so we need to give it some time.
    this.timeout(10000);
    const aff = __dirname + '/../dictionaries/en_US.aff';
    const dic = __dirname + '/../dictionaries/en_US.dic';
    const hunspellReader = new HunspellReader(aff, dic);

    it('reads dict entries', () => {
        const words = hunspellReader.readDicWords();
        expect(words).to.be.not.empty;
        return words
            .skip(10000)
            .take(10)
            // .do(info => { console.log(info); })
            .toPromise();
    });

    it('reads words with info', () => {
        const words = hunspellReader.readWordsRx();
        expect(words).to.be.not.empty;
        return words
            .skip(10000)
            .take(100)
            // .do(info => { console.log(info); })
            .toPromise();
    });

    it('reads words', () => {
        const words = hunspellReader.readWords();
        expect(words).to.be.not.empty;
        return words
            .skip(10000)
            .take(100)
            // .do(info => { console.log(info); })
            .toPromise();
    });
});

describe('HunspellReader Nl', function() {
    // We are read big files, so we need to give it some time.
    this.timeout(10000);
    const aff = __dirname + '/../dictionaries/nl.aff';
    const dic = __dirname + '/../dictionaries/nl.dic';
    const hunspellReader = new HunspellReader(aff, dic);

    it('reads words with info', () => {
        const words = hunspellReader.readWordsRx();
        expect(words).to.be.not.empty;
        return words
            .skip(200000)
            .take(200)
            // .do(info => { console.log(Aff.affWordToColoredString(info)); })
            .toPromise();
    });

});

describe('HunspellReader PT (Brazil)', function() {
    // We are read big files, so we need to give it some time.
    this.timeout(10000);
    const aff = __dirname + '/../dictionaries/Portuguese (Brazilian).aff';
    const dic = __dirname + '/../dictionaries/Portuguese (Brazilian).dic';
    const hunspellReader = new HunspellReader(aff, dic);

    it('reads words with info', () => {
        const words = hunspellReader.readWordsRx();
        expect(words).to.be.not.empty;
        return words
            .skip(200)
            .take(200)
            .do(info => { console.log(Aff.affWordToColoredString(info)); })
            .toPromise();
    });

});

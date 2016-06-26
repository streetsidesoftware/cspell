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
            .tap(info => { console.log(info); })
            .toPromise();
    });

    it('reads words with info', () => {
        const words = hunspellReader.readWordsEx();
        expect(words).to.be.not.empty;
        return words
            .skip(10000)
            .take(100)
            .tap(info => { console.log(info); })
            .toPromise();
    });

    it('reads words', () => {
        const words = hunspellReader.readWords();
        expect(words).to.be.not.empty;
        return words
            .skip(10000)
            .take(100)
            .tap(info => { console.log(info); })
            .toPromise();
    });
});

describe('HunspellReader Nl', function() {
    // We are read big files, so we need to give it some time.
    this.timeout(10000);
    const aff = __dirname + '/../dictionaries/nl.aff';
    const dic = __dirname + '/../dictionaries/nl.dic';
    const hunspellReader = new HunspellReader(aff, dic);

/*
    it('reads dict entries', () => {
        const words = hunspellReader.readDicWords();
        expect(words).to.be.not.empty;
        return words
            .skip(20000)
            .take(10)
            .tap(info => { console.log(info); })
            .toPromise();
    });
*/
    it('reads words with info', () => {
        const words = hunspellReader.readWordsEx();
        expect(words).to.be.not.empty;
        return words
            .skip(200000)
            // .skip(100)
            .take(200)
            .tap(info => { console.log(Aff.affWordToColoredString(info)); })
            .toPromise();
    });

/*
    it('reads words', () => {
        const words = hunspellReader.readWords();
        expect(words).to.be.not.empty;
        return words
            .skip(100000)
            .take(100)
            .tap(info => { console.log(info); })
            .toPromise();
    });
*/
});

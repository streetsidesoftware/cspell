import {expect} from 'chai';
import {HunspellReader} from './HunspellReader';

describe('HunspellReader', function() {
    // We are read big files, so we need to give it some time.
    this.timeout(10000);
    const enAff = __dirname + '/../dictionaries/en_US.aff';
    const enDic = __dirname + '/../dictionaries/en_US.dic';
    const hunspellReaderEn = new HunspellReader(enAff, enDic);

    it('reads US_EN', () => {
        const words = hunspellReaderEn.readDicWords();
        expect(words).to.be.not.empty;
        return words
            .skip(20000)
            .take(10)
            .tap(info => { console.log(info); })
            .toPromise();
    });

    it('reads US_EN', () => {
        const words = hunspellReaderEn.readWords();
        expect(words).to.be.not.empty;
        return words
            .skip(50000)
            .take(100)
            .tap(info => { console.log(info); })
            .toPromise();
    });
});
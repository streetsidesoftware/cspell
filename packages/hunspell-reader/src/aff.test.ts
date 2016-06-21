import * as aff from './aff';
import { expect } from 'chai';
import * as util from 'util';

describe('parse an aff file', () => {
    const filename = __dirname + '/../dictionaries/nl.aff';

    it ('reads an aff file', () => {
        return aff.parseAffFile(filename)
            .toPromise()
            .then(result => {
                console.log(util.inspect(result, { showHidden: true, depth: 5, colors: true }));
            });
    });
});
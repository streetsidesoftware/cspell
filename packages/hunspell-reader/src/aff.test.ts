import * as aff from './aff';
import { expect } from 'chai';

describe('parse an aff file', () => {
    const filename = __dirname + '/../dictionaries/nl.aff';

    it ('reads an aff file', () => {
        return aff.parseAffFile(filename)
            .toPromise()
            .then(result => {
                console.log(JSON.stringify(result, null, 2));
            });
    });
});
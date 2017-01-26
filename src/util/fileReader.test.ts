import { expect } from 'chai';
import * as fileReader from './fileReader';

describe('Validate file reader', () => {
    it('Catches errors for non-existent files', () => {
        return fileReader.textFileStream('./non-existent.txt')
            .toPromise()
            .then(
                () => {
                    expect(true).to.be.false;
                },
                error => {
                    expect(error).to.be.instanceof(Error);
                    return true;  // convert the error into a success.
                }
            );
    });
});

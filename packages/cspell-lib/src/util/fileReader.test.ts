import { expect } from 'chai';
import * as fileReader from './fileReader';

describe('Validate file reader', () => {
    test('Catches errors for non-existent files', () => {
        return fileReader.readLines('./non-existent.txt')
            .then(
                () => {
                    expect(true).to.be.false;
                },
                error => {
                    expect(error.toString()).to.be.contains('Error: ENOENT: no such file or directory');
                    return true;  // convert the error into a success.
                }
            );
    });
});

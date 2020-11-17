import * as fileReader from './fileReader';

describe('Validate file reader', () => {
    test('Catches errors for non-existent files', () => {
        return fileReader.readLines('./non-existent.txt').then(
            () => {
                expect(true).toBe(false);
                return;
            },
            (error) => {
                expect(error.toString()).toEqual(expect.stringContaining('Error: ENOENT: no such file or directory'));
                return true; // convert the error into a success.
            }
        );
    });
});

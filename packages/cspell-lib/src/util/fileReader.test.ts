import * as fileReader from './fileReader';

describe('Validate file reader', () => {
    test('Catches errors for non-existent files', () => {
        expect.assertions(1);
        return fileReader.readLines('./non-existent.txt').then(
            () => {
                expect(true).toBe(false);
            },
            (error) => {
                expect(error.toString()).toContain('Error: ENOENT: no such file or directory');
                return true; // convert the error into a success.
            }
        );
    });
});

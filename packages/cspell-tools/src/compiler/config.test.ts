import { isFileListSource, isFilePath, isFileSource } from './config';

describe('config', () => {
    test.each`
        value                   | expected
        ${'file'}               | ${false}
        ${{ filename: 'file' }} | ${false}
        ${{ listFile: 'file' }} | ${true}
    `('isFileListSource', ({ value, expected }) => {
        expect(isFileListSource(value)).toBe(expected);
    });

    test.each`
        value                   | expected
        ${'file'}               | ${true}
        ${{ filename: 'file' }} | ${false}
        ${{ listFile: 'file' }} | ${false}
    `('isFilePath', ({ value, expected }) => {
        expect(isFilePath(value)).toBe(expected);
    });

    test.each`
        value                   | expected
        ${'file'}               | ${false}
        ${{ filename: 'file' }} | ${true}
        ${{ listFile: 'file' }} | ${false}
    `('isFileSource', ({ value, expected }) => {
        expect(isFileSource(value)).toBe(expected);
    });
});

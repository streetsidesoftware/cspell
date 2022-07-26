import { CSpellIONode } from './CSpellIONode';

const sc = expect.stringContaining;

describe('CSpellIONode', () => {
    test('constructor', () => {
        const cspellIo = new CSpellIONode();
        expect(cspellIo).toBeDefined();
    });

    test.each`
        filename      | expected
        ${__filename} | ${sc('This bit of text')}
    `('readFile', async ({ filename, expected }) => {
        const cspellIo = new CSpellIONode();
        await expect(cspellIo.readFile(filename)).resolves.toEqual(expected);
    });

    test.each`
        filename      | expected
        ${__filename} | ${'Unhandled Request: fs:readFileSync' /* sc('This bit of text') */}
    `('readFileSync', ({ filename, expected }) => {
        const cspellIo = new CSpellIONode();
        expect(() => cspellIo.readFileSync(filename)).toThrow(expected);
    });

    // readFile(_uriOrFilename: string): Promise<string> {
    //     throw new ErrorNotImplemented('readFile');
    // }
    // readFileSync(_uriOrFilename: string): string {
    //     throw new ErrorNotImplemented('readFileSync');
    // }
    // writeFile(_uriOrFilename: string, _content: string): Promise<void> {
    //     throw new ErrorNotImplemented('writeFile');
    // }
    // getStat(_uriOrFilename: string): Promise<Stats> {
    //     throw new ErrorNotImplemented('getStat');
    // }
    // getStatSync(_uriOrFilename: string): Stats {
    //     throw new ErrorNotImplemented('getStatSync');
    // }
    // compareStats(left: Stats, right: Stats): number {
    //     return compareStats(left, right);
    // }
});

import * as app from './app';
import * as path from 'path';

const log = jest.spyOn(console, 'log').mockImplementation();
const error = jest.spyOn(console, 'error').mockImplementation();

describe('app', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test.each`
        params
        ${[path.join(path.basename(__dirname), 'code.ts')]}
        ${['../node_modules']}
        ${['-r', '.', 'dist']}
        ${['temp']}
        ${['-r', '.', 'temp']}
        ${['-r', '.']}
        ${[]}
        ${[' ']}
    `('app.run $params', async ({ params }) => {
        await app.run(['', '', ...params]);
        const stderr = error.mock.calls
            .map((c) => c.join(''))
            .join('\n')
            .replace(/\\/g, '/');
        const stdout = log.mock.calls
            .map((c) => c.join(''))
            .join('\n')
            .replace(/\\/g, '/');
        expect(stdout).toMatchSnapshot();
        expect(stderr).toMatchSnapshot();
    });

    test.each`
        params    | expected
        ${['-r']} | ${new Error('Missing root parameter.')}
    `('app.run errors $params', async ({ params, expected }) => {
        await expect(app.run(['', '', ...params])).rejects.toEqual(expected);
    });

    test('app.help', async () => {
        await app.run(['', '', '--help']);
        expect(error).toHaveBeenCalledTimes(0);
        expect(log.mock.calls).toMatchSnapshot();
    });
});

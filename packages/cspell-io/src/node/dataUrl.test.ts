import { pathToSample } from '../test/helper';
import { decodeDataUrl, encodeDataUrl, encodeDataUrlFromFile, toDataUrl, guessMimeType } from './dataUrl';

const sc = expect.stringContaining;

describe('dataUrl', () => {
    test.each`
        data                            | mediaType                   | attributes                     | expected
        ${'Hello, World!'}              | ${'text/plain'}             | ${undefined}                   | ${'data:text/plain;charset=utf8,Hello%2C%20World!'}
        ${'Hello, World!'}              | ${'text/plain'}             | ${[['filename', 'hello.txt']]} | ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}
        ${'Hello, World! %%%%$$$$,,,,'} | ${'text/plain'}             | ${undefined}                   | ${'data:text/plain;charset=utf8;base64,SGVsbG8sIFdvcmxkISAlJSUlJCQkJCwsLCw'}
        ${Buffer.from('Hello, World!')} | ${'text/plain'}             | ${[['filename', 'hello.txt']]} | ${'data:text/plain;filename=hello.txt;base64,SGVsbG8sIFdvcmxkIQ' /* cspell:disable-line */}
        ${'☸☹☺☻☼☾☿'}                    | ${'text/plain'}             | ${undefined}                   | ${'data:text/plain;charset=utf8;base64,4pi44pi54pi64pi74pi84pi-4pi_'}
        ${'Hello, World!'}              | ${'application/vnd.cspell'} | ${undefined}                   | ${'data:application/vnd.cspell;charset=utf8,Hello%2C%20World!'}
    `('encodeDataUrl $data', ({ data, mediaType, attributes, expected }) => {
        const url = encodeDataUrl(data, mediaType, attributes);
        expect(url).toEqual(expected);
        const urlObj = toDataUrl(data, mediaType, attributes);
        expect(urlObj.toString()).toEqual(url);
    });

    test.each`
        url                                                                          | expected
        ${'data:text/plain;charset=utf8,Hello%2C%20World!'}                          | ${{ mediaType: 'text/plain', encoding: 'utf8', data: Buffer.from('Hello, World!'), attributes: new Map([['charset', 'utf8']]) }}
        ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}       | ${{ mediaType: 'text/plain', encoding: 'utf8', data: Buffer.from('Hello, World!'), attributes: new Map([['charset', 'utf8'], ['filename', 'hello.txt']]) }}
        ${'data:text/plain;charset=utf8;base64,SGVsbG8sIFdvcmxkISAlJSUlJCQkJCwsLCw'} | ${{ mediaType: 'text/plain', encoding: 'utf8', data: Buffer.from('Hello, World! %%%%$$$$,,,,'), attributes: new Map([['charset', 'utf8']]) }}
        ${'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ' /* cspell:disable-line */}     | ${{ mediaType: 'text/plain', data: Buffer.from('Hello, World!'), attributes: new Map() }}
        ${'data:text/plain;charset=utf8;base64,4pi44pi54pi64pi74pi84pi-4pi_'}        | ${{ mediaType: 'text/plain', encoding: 'utf8', data: Buffer.from('☸☹☺☻☼☾☿'), attributes: new Map([['charset', 'utf8']]) }}
    `('encodeDataUrl $url', ({ url, expected }) => {
        const data = decodeDataUrl(url);
        expect(data).toEqual(expected);
    });

    test.each`
        file               | expected
        ${'cities.txt'}    | ${sc('data:text/plain;charset=utf8;filename=cities.txt,New%20York')}
        ${'cities.txt.gz'} | ${sc('data:application/gzip;filename=cities.txt.gz;base64,H')}
    `('encodeDataUrl $file', async ({ file, expected }) => {
        file = pathToSample(file);
        const dataUrl = await encodeDataUrlFromFile(file);
        expect(dataUrl).toEqual(expected);
    });

    test.each`
        file                | expected
        ${'cities.txt'}     | ${{ mimeType: 'text/plain', encoding: 'utf-8' }}
        ${'cities.txt.gz'}  | ${{ mimeType: 'application/gzip' }}
        ${'cities.trie'}    | ${{ mimeType: 'application/vnd.cspell.dictionary+trie', encoding: 'utf-8' }}
        ${'cities.trie.gz'} | ${{ mimeType: 'application/vnd.cspell.dictionary+trie.gz' }}
        ${'package.json'}   | ${{ mimeType: 'application/json', encoding: 'utf-8' }}
        ${'workflow.yml'}   | ${{ mimeType: 'application/x-yaml', encoding: 'utf-8' }}
        ${'workflow.yaml'}  | ${{ mimeType: 'application/x-yaml', encoding: 'utf-8' }}
    `('encodeDataUrl $file', ({ file, expected }) => {
        expect(guessMimeType(file)).toEqual(expected);
    });
});

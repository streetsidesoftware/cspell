import { toDataUrl, encodeDataUrl, decodeDataUrl } from './dataUrl';

describe('dataUrl', () => {
    test.each`
        data                            | mediaType       | attributes                     | expected
        ${'Hello, World!'}              | ${'text/plain'} | ${undefined}                   | ${'data:text/plain;charset=utf8,Hello%2C%20World!'}
        ${'Hello, World!'}              | ${'text/plain'} | ${[['filename', 'hello.txt']]} | ${'data:text/plain;charset=utf8;filename=hello.txt,Hello%2C%20World!'}
        ${'Hello, World! %%%%$$$$,,,,'} | ${'text/plain'} | ${undefined}                   | ${'data:text/plain;charset=utf8;base64,SGVsbG8sIFdvcmxkISAlJSUlJCQkJCwsLCw'}
        ${Buffer.from('Hello, World!')} | ${'text/plain'} | ${[['filename', 'hello.txt']]} | ${'data:text/plain;filename=hello.txt;base64,SGVsbG8sIFdvcmxkIQ' /* cspell:disable-line */}
        ${'☸☹☺☻☼☾☿'}                    | ${'text/plain'} | ${undefined}                   | ${'data:text/plain;charset=utf8;base64,4pi44pi54pi64pi74pi84pi-4pi_'}
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
});

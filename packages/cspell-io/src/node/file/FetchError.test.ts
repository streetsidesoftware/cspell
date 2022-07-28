import { FetchUrlError } from './FetchError';
import { toURL } from './util';

const oc = expect.objectContaining;

describe('FetchError', () => {
    test.each`
        url                    | status | message       | expected
        ${'http://google.com'} | ${404} | ${undefined}  | ${oc({ code: 'ENOENT', message: 'URL not found.' })}
        ${'http://google.com'} | ${403} | ${undefined}  | ${oc({ code: 'EACCES', message: 'Permission denied.' })}
        ${'http://google.com'} | ${403} | ${'Not good'} | ${oc({ code: 'EACCES', message: 'Not good' })}
        ${'http://google.com'} | ${500} | ${''}         | ${oc({ code: 'ECONNREFUSED', message: 'Fatal Error' })}
    `('create', ({ url, status, message, expected }) => {
        url = toURL(url);
        const e = FetchUrlError.create(url, status, message);
        expect(e).toEqual(expected);
        expect(e.url).toBe(url);
    });
});

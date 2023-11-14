import { describe, expect, test } from 'vitest';

import { FetchUrlError } from './FetchError.js';
import { toURL } from './url.js';

const oc = expect.objectContaining;

describe('FetchError', () => {
    test.each`
        url                    | status | message       | expected
        ${'http://google.com'} | ${404} | ${undefined}  | ${oc({ code: 'ENOENT', message: 'URL not found.' })}
        ${'http://google.com'} | ${403} | ${undefined}  | ${oc({ code: 'EACCES', message: 'Permission denied.' })}
        ${'http://google.com'} | ${403} | ${'Not good'} | ${oc({ code: 'EACCES', message: 'Not good' })}
        ${'http://google.com'} | ${500} | ${''}         | ${oc({ code: 'ECONNREFUSED', message: 'Fatal Error' })}
    `('create $status $message', ({ url, status, message, expected }) => {
        url = toURL(url);
        const e = FetchUrlError.create(url, status, message);
        expect(e).toEqual(expected);
        expect(e.url).toBe(url);
    });

    test.each`
        url                    | error                                                                                                      | expected
        ${'http://google.com'} | ${new Error('Not good')}                                                                                   | ${oc({ code: undefined, message: 'Not good' })}
        ${'http://google.com'} | ${Object.assign(new Error('Type Error'), { code: 'ENOENT', message: 'Not found' })}                        | ${oc({ code: 'ENOENT', message: 'Not found' })}
        ${'http://google.com'} | ${Object.assign(new Error('Not found'), { cause: { code: 'ENOTFOUND', message: 'Get Address failed.' } })} | ${oc({ code: 'ENOTFOUND', message: 'Get Address failed.' })}
    `('fromError $error', ({ url, error, expected }) => {
        url = toURL(url);
        const e = FetchUrlError.fromError(url, error);
        expect(e).toEqual(expected);
        expect(e.url).toBe(url);
    });
});

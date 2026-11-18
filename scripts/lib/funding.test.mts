import { describe, expect, test } from 'vitest';
import { parse } from 'yaml';

import { fundingFromYaml } from './funding.mts';

const sponsors = { type: 'github', url: 'https://github.com/sponsors/streetsidesoftware' };
const collective = { type: 'opencollective', url: 'https://opencollective.com/cspell' };
const thanksDev = { type: 'thanks.dev', url: 'https://thanks.dev/u/gh/streetsidesoftware' };
const sponsorPage = { type: 'corporate', url: 'https://streetsidesoftware.com/sponsor/' };

describe('fundingFromYaml', () => {
    test('converts every supported key, in the order of the file', () => {
        const text = `
github:
  - streetsidesoftware
# patreon: streetsidesoftware
open_collective: cspell
thanks_dev: u/gh/streetsidesoftware
custom:
  # - https://www.paypal.com/donate/?hosted_button_id=26LNBP2Q6MKCY
  - https://streetsidesoftware.com/sponsor/
`;
        expect(fundingFromYaml(text)).toEqual([sponsors, collective, thanksDev, sponsorPage]);
    });

    test.each`
        name                      | text                                                                             | expected
        ${'a single value'}       | ${'github: streetsidesoftware'}                                                  | ${[sponsors]}
        ${'a list of values'}     | ${'github:\n  - streetsidesoftware\n  - example'}                                | ${[sponsors, { type: 'github', url: 'https://github.com/sponsors/example' }]}
        ${'the order of keys'}    | ${'custom: https://streetsidesoftware.com/sponsor/\ngithub: streetsidesoftware'} | ${[sponsorPage, sponsors]}
        ${'keys without a value'} | ${'ko_fi:\npatreon: ""\ncustom: []\nopen_collective: cspell'}                    | ${[collective]}
        ${'an empty file'}        | ${''}                                                                            | ${[]}
    `('handles $name', ({ text, expected }) => {
        expect(fundingFromYaml(text)).toEqual(expected);
    });

    test('rejects a key it cannot convert', () => {
        expect(() => fundingFromYaml('github: streetsidesoftware\npatreon: streetsidesoftware')).toThrow(
            'FUNDING.yml keys must be one of: github, open_collective, thanks_dev, custom.',
        );
    });
});

describe('Validate yaml assumptions', () => {
    test('comments are not part of the parsed value', () => {
        expect(parse('# patreon: a\ncustom:\n  # - b\n  - c\n')).toEqual({ custom: ['c'] });
    });

    test('keys keep the order of the file', () => {
        expect(Object.keys(parse('thanks_dev: a\ngithub: b\ncustom: c\n'))).toEqual(['thanks_dev', 'github', 'custom']);
    });
});

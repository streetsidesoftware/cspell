import { describe, expect, test } from 'vitest';

import type { DictionaryInformation } from '../models/DictionaryInformation.js';
import { mapDictionaryInformation } from './mapDictionaryInfo.js';

describe('mapDictionaryInfo', () => {
    test.each`
        info
        ${{}}
        ${di({ alphabet: 'a-e', accents: '' })}
        ${di({ alphabet: 'a-eA-E', accents: '\u0301' })}
    `('mapDictionaryInformation', ({ info }) => {
        expect(mapDictionaryInformation(info)).toMatchSnapshot();
    });
});

function di(info: DictionaryInformation): DictionaryInformation {
    return info;
}

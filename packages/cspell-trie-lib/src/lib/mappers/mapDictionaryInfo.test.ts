import type { DictionaryInformation } from '../models/DictionaryInformation';
import { mapDictionaryInformation } from './mapDictionaryInfo';

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

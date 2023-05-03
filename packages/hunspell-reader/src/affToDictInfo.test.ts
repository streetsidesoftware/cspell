import path from 'path';
import { describe, expect, test } from 'vitest';

import { parseAffFile } from './affReader';
import { affToDicInfo } from './affToDicInfo';

const dictionaries = path.join(__dirname, '../dictionaries');
const sampleAff = path.join(dictionaries, 'Portuguese (Brazilian).aff');
const sampleLocale = 'pt-br';

describe('affToDictInfo', () => {
    test('parseAffFile', async () => {
        const affInfo = await parseAffFile(sampleAff);
        const info = affToDicInfo(affInfo, sampleLocale);
        expect(info).toMatchSnapshot();
    });
});

import { describe, expect, test } from 'vitest';

import { IntlSegmentTextTransformer } from './IntlSegmentTextTransformer.js';

describe('IntlSegmentTextTransformer', () => {
    test.each`
        locale                            | input                                  | expected
        ${'en-US'}                        | ${'Hello world'}                       | ${'Hello world'}
        ${'en-US'}                        | ${'Block(s) of text, 1234, sym $%.[]'} | ${'Block(s) of text, 1234, sym $%.[]'}
        ${'en-US'}                        | ${'one.two.three-four_five'}           | ${'one.two.three-four_five'}
        ${'fr-FR'}                        | ${'Bonjour le monde'}                  | ${'Bonjour le monde'}
        ${'th-TH'}                        | ${'สวัสดีโลก'}                         | ${'สวัสดี โลก' /* cspell:disable-line */}
        ${getSample('sampleThai').locale} | ${getSample('sampleThai').input}       | ${getSample('sampleThai').expected}
    `('should segment text correctly $locale $input', ({ locale, input, expected }) => {
        const t = new IntlSegmentTextTransformer(locale);
        const result = t.transform(input);
        expect(result.text).toBe(expected);
    });
});

interface Sample {
    locale: string;
    input: string;
    expected: string;
}

const samples = {
    // cspell:words ความ ต ประสบ สำเร็จ เรียน ภาษา อดทน ฝึกฝน สม่ำเสมอ
    // cspell:words ต้องการ อย่าง ต้อง
    sampleThai: {
        locale: 'th-TH',
        input: 'ถ้าคุณต้องการที่จะประสบความสำเร็จในการเรียนภาษาไทย คุณต้องมีความอดทนและฝึกฝนทุกวันอย่างสม่ำเสมอ',
        expected:
            'ถ้า คุณ ต้องการ ที่ จะ ประสบ ความ สำเร็จ ใน การ เรียน ภาษา ไทย คุณ ต้อง มี ความ อดทน และ ฝึกฝน ทุก วัน อย่าง สม่ำเสมอ',
    },
} as const;

function getSample(name: keyof typeof samples): Sample {
    return samples[name];
}

import { promises as fs } from 'node:fs';

import { describe, expect, test } from 'vitest';

import { createTrieRootFromList } from '../TrieNode/trie-util.js';
import { walkerWordsITrie } from '../walker/index.js';
import { FastTrieBlob } from './FastTrieBlob.js';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.js';

const debug = false;

describe('FastTrieBlob', () => {
    const words = getSampleWords();

    test('insert', () => {
        const ft = new FastTrieBlobBuilder();
        ft.insert(words);
        ft.insert('hello');
        expect(ft.has('hello')).toBe(true);
        expect(ft.has('Hello')).toBe(false);
        ft.insert('Hello');
        expect(ft.has('Hello')).toBe(true);
        expect(words.findIndex((word) => !ft.has(word))).toBe(-1);
    });

    test('expected', () => {
        const ft = FastTrieBlobBuilder.fromWordList(words);
        expect(ft.has('walk')).toBe(true);
        expect(ft.charIndex.length).toBe(new Set([...words.join('')]).size + 1);
    });

    test('createTriFromList', () => {
        const root = createTrieRootFromList(words);
        const ft = FastTrieBlobBuilder.fromTrieRoot(root);
        expect(ft.charIndex.length).toBe(new Set([...words.join('')]).size + 1);
        expect(ft.has('walk')).toBe(true);
        expect(words.findIndex((word) => !ft.has(word))).toBe(-1);
        expect(ft.has('hello')).toBe(false);
    });

    test('toTrieBlob', async () => {
        const ft = FastTrieBlobBuilder.fromWordList(words);
        const trie = ft.toTrieBlob();
        expect(words.findIndex((word) => !trie.has(word))).toBe(-1);
        const revFt = FastTrieBlob.fromTrieBlob(trie);
        debug && (await writeToJsonFile('fastTrieBlobA.json', ft));
        debug && (await writeToJsonFile('fastTrieBlobB.json', revFt));
        expect(revFt.toJSON()).toEqual(ft.toJSON());
    });

    test('toITrieNodeRoot', async () => {
        const ft = FastTrieBlobBuilder.fromWordList(words);
        const trie = ft.toTrieBlob();
        for (const word of words) {
            expect(trie.has(word), `Expect to find "${word} in trie."`).toBe(true);
        }
        const iTrieRoot = trie.getRoot();
        for (const word of walkerWordsITrie(iTrieRoot)) {
            expect(words.includes(word), `Expect to find "${word} in words."`).toBe(true);
        }
    });
});

/**
 * The sample words and characters are from a mix of languages intended to stress the system by having more that 256 unique characters.
 * @returns "words" to add to the dictionary.
 */
function getSampleWords() {
    // cspell:disable
    const text = `
    one, two, three, four, walk, walking, walks, wall, walls, walled

     Alpha - Α α Beta - Β β Gamma - Γ γ Delta - Δ δ Epsilon - Ε ε Zeta - Ζ ζ Eta - Η η Theta - Θ θ Iota - Ι ι Kappa - Κ κ Lambda - Λ λ
     Mu - Μ μ Nu - Ν ν Xi - Ξ ξ Omicron - Ο ο Pi - Π π Rho - Ρ ρ Sigma - Σ σ/ς Tau - Τ τ Upsilon - Υ υ Phi - Φ φ Chi - Χ χ Psi - Ψ ψ Omega - Ω ω

     A aB bC cD dE eF fG gH hI iJ jK kL lM mN nO oP pQ qR rS sT tU uV vW wX xY yZ z

     a ah b bay c say d day e uh f eff g zheh h ahsh i ee j zhee k ka l ell m em n en
     o oh p pay q koo r air s ess t tay u ooh v vay w doo-bleh-vay x eeks y ee-grek z zed

     The modern Russian alphabet consists of 33 letters: twenty consonants (⟨б⟩, ⟨в⟩, ⟨г⟩, ⟨д⟩, ⟨ж⟩, ⟨з⟩, ⟨к⟩, ⟨л⟩, ⟨м⟩, ⟨н⟩, ⟨п⟩, ⟨р⟩, ⟨с⟩,
    ⟨т⟩, ⟨ф⟩, ⟨х⟩, ⟨ц⟩, ⟨ч⟩, ⟨ш⟩, ⟨щ⟩), ten vowels (⟨а⟩, ⟨е⟩, ⟨ё⟩, ⟨и⟩, ⟨о⟩, ⟨у⟩, ⟨ы⟩, ⟨э⟩, ⟨ю⟩, ⟨я⟩), a semivowel / consonant (⟨й⟩), and two
    modifier letters or "signs" (⟨ъ⟩, ⟨ь⟩) that alter pronunciation of a preceding consonant or a following vowel.

    1	ก	ก ไก่ (gɔɔ gài)	ko kai (chicken)	k	k	k	k	mid
    2	ข	ข ไข่ (kɔ̌ɔ kài)	kho khai (egg)	kh	k	kʰ	k	high
    3	ฃ	ฃ ขวด (kɔ̌ɔ kùuat)	kho khuat (bottle) [obsolete]	kh	k	kʰ	k	high
    4	ค	ค ควาย (kɔɔ kwaai)	kho khwai (water buffalo)	kh	k	kʰ	k	low
    5	ฅ	ฅ คน (kɔɔ kon)	kho khon (person) [obsolete]	kh	k	kʰ	k	low
    6	ฆ	ฆ ระฆัง (kɔɔ rá-kang)	kho ra-khang (bell)	kh	k	kʰ	k	low
    7	ง	ง งู (ngɔɔ nguu)	ngo ngu (snake)	ng	ng	ŋ	ŋ	low
    8	จ	จ จาน (jɔɔ jaan)	cho chan (plate)	ch	t	tɕ	t	mid
    9	ฉ	ฉ ฉิ่ง (chɔ̌ɔ chìng)	cho ching (cymbals)	ch	-	tɕʰ	-	high
    10	ช	ช ช้าง (chɔɔ cháang)	cho chang (elephant)	ch	t	tɕʰ	t	low
    11	ซ	ซ โซ่ (sɔɔ sôo)	so so (chain)	s	t	s	t	low
    12	ฌ	ฌ เฌอ (chɔɔ chəə)	cho choe (bush)	ch	-	tɕʰ	-	low
    13	ญ	ญ หญิง (yɔɔ yǐng)	yo ying (woman)	y	n	j	n	low
    14	ฎ	ฎ ชฎา (dɔɔ chá-daa)	do cha-da (headdress)	d	t	d	t	mid
    15	ฏ	ฏ ปฏัก (dtɔɔ bpà-dtàk)	to pa-tak (goad, cattleprod spear)	t	t	t	t	mid
    16	ฐ	ฐ ฐาน (tɔ̌ɔ tǎan)	tho than (base)	th	t	tʰ	t	high
    17	ฑ	ฑ มณโฑ	tho nangmon-tho (Mandodari, character from Ramayana)	th	t	tʰ	t	low
    18	ฒ	ฒ ผู้เฒ่า	tho phu-thao (elder)	th	t	tʰ	t	low
    19	ณ	ณ เณร	no nen (novice monk)	n	n	n	n	low
    20	ด	ด เด็ก	do dek (child)	d	t	d	t	mid
    21	ต	ต เต่า	to tao (turtle)	t	t	t	t	mid
    22	ถ	ถ ถุง	tho thung (sack)	th	t	tʰ	t	high
    23	ท	ท ทหาร	tho thahan (soldier)	th	t	tʰ	t	low
    24	ธ	ธ ธง	tho thong (flag)	th	t	tʰ	t	low
    25	น	น หนู	no nu (mouse)	n	n	n	n	low
    26	บ	บ ใบไม้	bo baimai (leaf)	b	p	b	p	mid
    27	ป	ป ปลา	po pla (fish)	p	p	p	p	mid
    28	ผ	ผ ผึ้ง	pho phueng (bee)	ph	-	pʰ	-	high
    29	ฝ	ฝ ฝา	fo fa (lid)	f	-	f	-	high
    30	พ	พ พาน	pho phan (tray)	ph	p	pʰ	p	low
    31	ฟ	ฟ ฟัน	fo fan (teeth)	f	p	f	p	low
    32	ภ	ภ สำเภา	pho sam-phao (sailboat)	ph	p	pʰ	p	low
    33	ม	ม ม้า	mo ma (horse)	m	m	m	m	low
    34	ย	ย ยักษ์	yo yak (giant)	y	y	j	j	low
    35	ร	ร เรือ	ro ruea (boat)	r	n	r	n	low
    36	ล	ล ลิง	lo ling (monkey)	l	n	l	n	low
    37	ว	ว แหวน	wo waen (ring)	w	w	w	w	low
    38	ศ	ศ ศาลา	so sala (pavilion)	s	t	s	t	high
    39	ษ	ษ ฤๅษี	so rue-si (hermit)	s	t	s	t	high
    40	ส	ส เสือ	so suea (tiger)	s	t	s	t	high
    41	ห	ห หีบ	ho hip (chest)	h	-	h	-	high
    42	ฬ	ฬ จุฬา	lo chu-la (kite)	l	n	l	n	low
    43	อ	อ อ่าง	o ang (basin)	*	-	ʔ	-	mid
    44	ฮ	ฮ นกฮูก	ho nok-huk (owl)	h	-	h	-	low

    U+304x		ぁ	あ	ぃ	い	ぅ	う	ぇ	え	ぉ	お	か	が	き	ぎ	く
    U+305x	ぐ	け	げ	こ	ご	さ	ざ	し	じ	す	ず	せ	ぜ	そ	ぞ	た
    U+306x	だ	ち	ぢ	っ	つ	づ	て	で	と	ど	な	に	ぬ	ね	の	は
    U+307x	ば	ぱ	ひ	び	ぴ	ふ	ぶ	ぷ	へ	べ	ぺ	ほ	ぼ	ぽ	ま	み
    U+308x	む	め	も	ゃ	や	ゅ	ゆ	ょ	よ	ら	り	る	れ	ろ	ゎ	わ
    U+309x	ゐ	ゑ	を	ん	ゔ	ゕ	ゖ			゙	゚	゛	゜	ゝ	ゞ	ゟ

    U+00C0	À	Latin Capital Letter A with grave
    U+00C1	Á	Latin Capital letter A with acute
    U+00C2	Â	Latin Capital letter A with circumflex
    U+00C3	Ã	Latin Capital letter A with tilde
    U+00C4	Ä	Latin Capital letter A with diaeresis
    U+00C5	Å	Latin Capital letter A with ring above
    U+00C6	Æ	Latin Capital letter AE
    U+00C7	Ç	Latin Capital letter C with cedilla
    U+00C8	È	Latin Capital letter E with grave
    U+00C9	É	Latin Capital letter E with acute
    U+00CA	Ê	Latin Capital letter E with circumflex
    U+00CB	Ë	Latin Capital letter E with diaeresis
    U+00CC	Ì	Latin Capital letter I with grave
    U+00CD	Í	Latin Capital letter I with acute
    U+00CE	Î	Latin Capital letter I with circumflex
    U+00CF	Ï	Latin Capital letter I with diaeresis
    U+00D0	Ð	Latin Capital letter Eth
    U+00D1	Ñ	Latin Capital letter N with tilde
    U+00D2	Ò	Latin Capital letter O with grave
    U+00D3	Ó	Latin Capital letter O with acute
    U+00D4	Ô	Latin Capital letter O with circumflex
    U+00D5	Õ	Latin Capital letter O with tilde
    U+00D6	Ö	Latin Capital letter O with diaeresis
    Mathematical operator
    U+00D7	×	Multiplication sign
    Letters
    U+00D8	Ø	Latin Capital letter O with stroke
    U+00D9	Ù	Latin Capital letter U with grave
    U+00DA	Ú	Latin Capital letter U with acute
    U+00DB	Û	Latin Capital Letter U with circumflex
    U+00DC	Ü	Latin Capital Letter U with diaeresis
    U+00DD	Ý	Latin Capital Letter Y with acute
    U+00DE	Þ	Latin Capital Letter Thorn
    U+00DF	ß	Latin Small Letter sharp S
    U+00E0	à	Latin Small Letter A with grave
    U+00E1	á	Latin Small Letter A with acute
    U+00E2	â	Latin Small Letter A with circumflex
    U+00E3	ã	Latin Small Letter A with tilde
    U+00E4	ä	Latin Small Letter A with diaeresis
    U+00E5	å	Latin Small Letter A with ring above
    U+00E6	æ	Latin Small Letter AE
    U+00E7	ç	Latin Small Letter C with cedilla
    U+00E8	è	Latin Small Letter E with grave
    U+00E9	é	Latin Small Letter E with acute
    U+00EA	ê	Latin Small Letter E with circumflex
    U+00EB	ë	Latin Small Letter E with diaeresis
    U+00EC	ì	Latin Small Letter I with grave
    U+00ED	í	Latin Small Letter I with acute
    U+00EE	î	Latin Small Letter I with circumflex
    U+00EF	ï	Latin Small Letter I with diaeresis
    U+00F0	ð	Latin Small Letter Eth
    U+00F1	ñ	Latin Small Letter N with tilde
    U+00F2	ò	Latin Small Letter O with grave
    U+00F3	ó	Latin Small Letter O with acute
    U+00F4	ô	Latin Small Letter O with circumflex
    U+00F5	õ	Latin Small Letter O with tilde
    U+00F6	ö	Latin Small Letter O with diaeresis
    Mathematical operator
    U+00F7	÷	Division sign
    Letters
    U+00F8	ø	Latin Small Letter O with stroke
    U+00F9	ù	Latin Small Letter U with grave
    U+00FA	ú	Latin Small Letter U with acute
    U+00FB	û	Latin Small Letter U with circumflex
    U+00FC	ü	Latin Small Letter U with diaeresis
    U+00FD	ý	Latin Small Letter Y with acute
    U+00FE	þ	Latin Small Letter Thorn
    U+00FF	ÿ	Latin Small Letter Y with diaeresis

    U+053x		Ա	Բ	Գ	Դ	Ե	Զ	Է	Ը	Թ	Ժ	Ի	Լ	Խ	Ծ	Կ
    U+054x	Հ	Ձ	Ղ	Ճ	Մ	Յ	Ն	Շ	Ո	Չ	Պ	Ջ	Ռ	Ս	Վ	Տ
    U+055x	Ր	Ց	Ւ	Փ	Ք	Օ	Ֆ			ՙ	՚	՛	՜	՝	՞	՟
    U+056x	ՠ	ա	բ	գ	դ	ե	զ	է	ը	թ	ժ	ի	լ	խ	ծ	կ
    U+057x	հ	ձ	ղ	ճ	մ	յ	ն	շ	ո	չ	պ	ջ	ռ	ս	վ	տ
    U+058x	ր	ց	ւ	փ	ք	օ	ֆ	և	ֈ	։	֊			֍	֎	֏

    U+090x	ऀ	ँ	ं	ः	ऄ	अ	आ	इ	ई	उ	ऊ	ऋ	ऌ	ऍ	ऎ	ए
    U+091x	ऐ	ऑ	ऒ	ओ	औ	क	ख	ग	घ	ङ	च	छ	ज	झ	ञ	ट
    U+092x	ठ	ड	ढ	ण	त	थ	द	ध	न	ऩ	प	फ	ब	भ	म	य
    U+093x	र	ऱ	ल	ळ	ऴ	व	श	ष	स	ह	ऺ	ऻ	़	ऽ	ा	ि
    U+094x	ी	ु	ू	ृ	ॄ	ॅ	ॆ	े	ै	ॉ	ॊ	ो	ौ	्	ॎ	ॏ
    U+095x	ॐ	॑	॒	॓	॔	ॕ	ॖ	ॗ	क़	ख़	ग़	ज़	ड़	ढ़	फ़	य़
    U+096x	ॠ	ॡ	ॢ	ॣ	।	॥	०	१	२	३	४	५	६	७	८	९
    U+097x	॰	ॱ	ॲ	ॳ	ॴ	ॵ	ॶ	ॷ	ॸ	ॹ	ॺ	ॻ	ॼ	ॽ	ॾ	ॿ

    `.normalize('NFC');
    // cspell:enable
    const textWords = text.split(/[\s\p{P}+~]/gu);
    // cspell:disable-next-line
    const otherWords = ['ＷＩＮＴＲＡＰ', 'ᓀᐦᐃᔭᐍᐏᐣ'];
    const rawWords = [...textWords, ...otherWords]
        .map((word) => word.normalize('NFC'))
        .flatMap((word) => [word, word.toLowerCase(), word.toUpperCase()])
        .flatMap((word) => [word, word.normalize('NFD').replace(/\p{M}/gu, '')])
        .map((a) => a.trim())
        .filter((a) => !!a);
    const setOfWords = new Set(rawWords);
    const words = [...setOfWords].sort();
    // console.log('Unique letter count: %o', new Set([...words.join('')]).size);
    return words;
}

function writeToJsonFile(filename: string, obj: unknown): Promise<void> {
    return fs.writeFile(filename, JSON.stringify(obj, null, 2), 'utf8');
}

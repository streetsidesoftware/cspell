//#region fixtures/dictionaries/btrie/cspell.config.yaml
var cspell_config_default = {
    dictionaryDefinitions: [
        {
            name: 'words',
            path: 'cspell-vfs:///e08714f8e75ff0a4/dictionaries/btrie/btrie-words.btrie.gz',
        },
        {
            name: 'words-btrie',
            path: 'cspell-vfs:///e08714f8e75ff0a4/dictionaries/btrie/btrie-words.btrie.gz',
        },
    ],
    dictionaries: ['words', 'words-btrie'],
    overrides: [
        {
            filename: 'test.md',
            dictionaries: ['!words', 'words-btrie'],
        },
        {
            filename: 'test2.md',
            dictionaries: ['words', '!words-btrie'],
        },
    ],
    vfs: {
        'cspell-vfs:///e08714f8e75ff0a4/dictionaries/btrie/btrie-words.btrie.gz': {
            data: 'H4sIAAAAAAAAA52SP28TQRDFf3NOAYECoTgKJysiCv9iC2OsCIEBKTHGcoyxAjYgCyF09tnJyudbOJ9lR0ip0iAq6Ojp6PgMNIiOr0BHTUWF1nuiSMk0T/P2vbej2W1Hql8OdFec1EKhkC9czxcKR8Bv4V+trR0e5nKlEsdq5sDH4+R/1BKwfR7uXYPKXbi/BdUq7DSgsQsPW9B8ArvPoNWBznPovoDeS/D3YfAaggmEU3h1ANM3gICcgFEaZBHi5TnFOG2x74KchiADDjBagXDVnh0kmnjdYpj0+jLIEqgNEBf2ctarLoK+CrIKsdFegtBNvJtW4xVB3QC5AioNThYGNyG4DVIEz/g2QRsswbhs/VElmdfwyxDWQO5AULfobyT5LugmyBYo483C1HjKoJJZPDN/BYaGz4MyWVVQGXs+qINTt/18Bw1QPZvf90ANQDIwrll9ULN9sA4pkz8ENYKJBmmCbzIcGBldG7oje7/vwplUq23efgV4avYE5Oa/4RxnOcUC39iRWxTJcYFtfvETkT90eMwDKjwS4SQRQ3ze84F3HPEWj0X5gitlPvOJrJTkB9/5Sj/yvUnkxSpWejaLIy/sKR16kR6PVThQk6A/01Ev1t7e/l/VbUArEQMAAA==',
            encoding: 'base64',
        },
    },
};

//#endregion
//#region fixtures/dictionaries/btrie/cspell.config.bundle.js
/**
 * A bundled cspell configuration for testing the bundled dictionary.
 * It uses tsdown to bundle the dictionary and then uses that bundle in unit tests.
 * See [tsdown.config.ts](../../../tsdown.config.ts) for the tsdown configuration.
 *
 * To update the bundle from `dist`, run `bash ./copy-bundle.sh`. See: [copy-bundle.sh](./copy-bundle.sh).
 */
const config = cspell_config_default;

//#endregion
export { config as default };

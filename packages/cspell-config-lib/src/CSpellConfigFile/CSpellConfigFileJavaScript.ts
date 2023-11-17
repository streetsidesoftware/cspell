import type { CSpellSettings } from '@cspell/cspell-types';

import { ImplCSpellConfigFile } from '../CSpellConfigFile.js';

export class CSpellConfigFileJavaScript extends ImplCSpellConfigFile {
    get readonly(): boolean {
        return true;
    }

    constructor(
        readonly url: URL,
        readonly settings: CSpellSettings,
    ) {
        super(url, settings);
    }

    addWords(_words: string[]): this {
        throw new Error('Unable to add words to a JavaScript config file.');
    }
}

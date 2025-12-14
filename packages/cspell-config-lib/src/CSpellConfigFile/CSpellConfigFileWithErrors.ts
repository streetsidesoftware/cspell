import type { CSpellSettings } from '@cspell/cspell-types';

import { ImplCSpellConfigFile } from '../CSpellConfigFile.js';

/**
 * A CSpell configuration file that had errors during loading.
 */
export class CSpellConfigFileWithErrors extends ImplCSpellConfigFile {
    constructor(
        readonly url: URL,
        readonly settings: CSpellSettings,
        readonly error: Error,
    ) {
        super(url, settings);
    }

    get readonly(): boolean {
        return true;
    }
}

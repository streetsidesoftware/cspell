import type { CSpellSettings } from '@cspell/cspell-types';

import { ImplCSpellConfigFile } from '../CSpellConfigFile.js';

export class CSpellConfigFileInMemory extends ImplCSpellConfigFile {
    constructor(
        /** A url representing where it might exist, used to resolve imports. */
        readonly url: URL,
        readonly settings: CSpellSettings,
    ) {
        super(url, settings);
    }

    setSchema(schema: string): this {
        this.settings.$schema = schema;
        return this;
    }

    get virtual(): boolean {
        return true;
    }
}

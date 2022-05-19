import { CSpellSettings } from '@cspell/cspell-types';
import { Serializer } from './Serializer';

export interface CSpellConfigFile {
    readonly uri: string;
    readonly settings: CSpellSettings;
    serialize(): string;
}

export class ImplCSpellConfigFile implements CSpellConfigFile {
    constructor(readonly uri: string, readonly settings: CSpellSettings, readonly serializer: Serializer) {}

    serialize(): string {
        return this.serializer(this.settings);
    }
}

import type { CSpellSettings } from '@cspell/cspell-types';

export interface Serializer {
    (settings: CSpellSettings): string;
}

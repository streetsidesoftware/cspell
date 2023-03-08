import type { CSpellIO } from 'cspell-io';
import { CSpellIONode } from 'cspell-io';

const cspellIO = new CSpellIONode();

export function getCSpellIO(): CSpellIO {
    return cspellIO;
}

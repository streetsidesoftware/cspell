import { CSpellIO, CSpellIONode } from 'cspell-io';

const cspellIO = new CSpellIONode();

export function getCSpellIO(): CSpellIO {
    return cspellIO;
}

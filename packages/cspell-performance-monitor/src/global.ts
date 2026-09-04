import type { CSpellGlobalSettings } from './types.ts';

const symbolCSpell = Symbol.for('cspell');

type GlobalCSpell = typeof globalThis & { [symbolCSpell]?: CSpellGlobalSettings };

const globalThisCSpell: GlobalCSpell = globalThis;

export function getGlobalCSpellSettings(): CSpellGlobalSettings {
    return (globalThisCSpell[symbolCSpell] ??= {});
}

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

require('./.pnp.cjs').setup();

/** @type { import("@cspell/cspell-types").CSpellUserSettings } */
const cspell = {
    description: 'Make cspell Yarn 2 PNP aware',
    usePnP: true,
    import: ['./cspell.config.yaml'],
};

export default cspell;

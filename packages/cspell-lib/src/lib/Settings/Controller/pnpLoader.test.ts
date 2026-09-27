import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import resolveFrom from 'resolve-from';
import { describe, expect, test } from 'vitest';

import { pathPackageSamplesURL, pathRepoRoot } from '../../../test-util/test.locations.js';
import { UnsupportedPnpFile } from './ImportError.js';
import { clearPnPGlobalCache, pnpLoader } from './pnpLoader.js';

const root = pathRepoRoot;
const uriSamples = pathPackageSamplesURL;
const uriDirectory = uriSamples;
const uriBadPnp = new URL('bad-pnp/', uriSamples);
const uriProjectA = new URL('pnp/project-a/', uriSamples);
const uriProjectB = new URL('pnp/project-b/', uriSamples);
const uriProjectAPnp = new URL('.pnp.js', uriProjectA);
const uriProjectBPnp = new URL('.pnp.js', uriProjectB);

const uriTestPackages = pathToFileURL(path.join(root, 'test-packages/yarn/'));
const uriYarn2TestMed = new URL('yarn2/test-yarn-med/', uriTestPackages);
const uriYarn2TestSci = new URL('yarn2/test-yarn-sci/', uriTestPackages);
const uriYarn2TestMedPnp = new URL('.pnp.cjs', uriYarn2TestMed);
const uriYarn2TestSciPnp = new URL('.pnp.cjs', uriYarn2TestSci);

const fsPath = fileURLToPath;

describe('Validate PnPLoader', () => {
    test('pnpLoader bad pnp', async () => {
        // Note: this is tested first because Yarn2 .pnp.js will add a resolver that matches against other .pnp.js files
        // causing this to break.
        const loader = pnpLoader();
        const r = loader.load(uriBadPnp);
        await expect(r).rejects.toBeInstanceOf(UnsupportedPnpFile);
    });

    test('pnpLoader', async () => {
        const loader = pnpLoader();

        expect(await loader.peek(uriDirectory)).toBeUndefined();
        expect(await loader.load(uriDirectory)).toBeUndefined();

        const pnp = await loader.load(uriProjectA);
        expect(pnp?.toString().toLocaleLowerCase()).toBe(uriProjectAPnp.toString().toLowerCase());
    });

    test('pnpLoader shared cache', async () => {
        const loader = pnpLoader();
        const pnp = await loader.load(uriProjectA);
        expect(pnp?.toString().toLocaleLowerCase()).toBe(uriProjectAPnp.toString().toLowerCase());

        // Check Shared cache
        const loader2 = pnpLoader();
        const pnpPeek = await loader2.peek(uriProjectA);
        expect(pnpPeek).toBe(pnp);
    });

    test('pnpLoader multiple .pnp.js', async () => {
        const loader = pnpLoader();

        expect(await loader.peek(uriDirectory)).toBeUndefined();
        expect(await loader.load(uriDirectory)).toBeUndefined();

        const pnpA = await loader.load(uriProjectA);
        expect(pnpA?.toString().toLocaleLowerCase()).toBe(uriProjectAPnp.toString().toLowerCase());

        const pnpB = await loader.load(uriProjectB);
        expect(pnpB?.toString().toLocaleLowerCase()).toBe(uriProjectBPnp.toString().toLowerCase());
    });

    test('pnpLoader clear cache', async () => {
        const loader = pnpLoader();
        const pnp = await loader.load(uriProjectA);
        expect(pnp?.toString().toLocaleLowerCase()).toBe(uriProjectAPnp.toString().toLowerCase());

        await loader.clearCache();
        const pnpPeek = await loader.peek(uriProjectA);
        expect(pnpPeek).toBeUndefined();

        const pnp2 = await loader.load(uriProjectA);
        expect(pnp2?.toString().toLocaleLowerCase()).toBe(pnp?.toString().toLocaleLowerCase());
        expect(pnp2).not.toBe(pnp);
    });

    test('pnpLoader pass 2', async () => {
        const loader = pnpLoader();

        expect(await loader.peek(uriDirectory)).toBeUndefined();
        expect(await loader.load(uriDirectory)).toBeUndefined();

        const pnp = await loader.load(uriProjectA);
        expect(pnp?.toString().toLocaleLowerCase()).toBe(uriProjectAPnp.toString().toLowerCase());
    });

    test('pnpLoader multiple clear cache', async () => {
        const loader = pnpLoader();
        const pnp = await loader.load(uriProjectA);
        expect(pnp?.toString().toLocaleLowerCase()).toBe(uriProjectAPnp.toString().toLowerCase());

        const loader2 = pnpLoader();
        const pnp2 = await loader.load(uriProjectB);
        expect(pnp2?.toString().toLocaleLowerCase()).toBe(uriProjectBPnp.toString().toLowerCase());

        // trigger two cache clears
        const cc = clearPnPGlobalCache();
        const cc1 = loader.clearCache();
        const cc2 = loader2.clearCache();
        // try and load before the cache clear is finished.
        const p = loader.load(uriProjectA);
        const r = Promise.race([cc1.then(() => 'clear'), p.then(() => 'load')]);

        // Even though the loaders are different, they use the same lock.
        expect(cc1).toBe(cc);
        expect(cc2).toBe(cc1);

        // We expect the clear to finish first before the load is allowed to happen.
        await expect(r).resolves.toBe('clear');
        await Promise.all([cc1, p]);
    });

    test('pnpLoader shared .pnp.js', async () => {
        const loader = pnpLoader();

        const pnp = await loader.load(uriProjectA);
        const pnp2 = await loader.load(new URL('src/', uriProjectA));
        expect(pnp?.toString().toLocaleLowerCase()).toBe(uriProjectAPnp.toString().toLowerCase());
        expect(pnp2).toEqual(pnp);
    });

    test('pnpLoader different files', async () => {
        const loaderA = pnpLoader();
        const loaderB = pnpLoader(['.not_found.js']);

        const pnp = await loaderA.load(uriProjectA);
        const nfPnp = await loaderB.load(uriProjectA);
        expect(pnp?.toString().toLocaleLowerCase()).toBe(uriProjectAPnp.toString().toLowerCase());
        expect(nfPnp).toBeUndefined();
    });

    test('pnpLoader bad schema', async () => {
        const loader = pnpLoader();
        const uri = new URL(uriProjectA.pathname, 'ftp://example.com/');
        const r = loader.load(uri);
        await expect(r).resolves.toEqual(undefined);
    });
});

// Needs the Yarn test projects to be installed first: `pnpm run setup-yarn`.
describe.runIf(process.env['CSPELL_TEST_YARN'])('Validate PnPLoader with Yarn', () => {
    test('load Yarn .pnp.cjs files and resolve dictionaries', async () => {
        const loader = pnpLoader();

        const yarnPnpMed = await loader.load(uriYarn2TestMed);
        expect(yarnPnpMed?.toString().toLocaleLowerCase()).toBe(uriYarn2TestMedPnp.toString().toLowerCase());

        const yarnPnpSci = await loader.load(uriYarn2TestSci);
        expect(yarnPnpSci?.toString().toLocaleLowerCase()).toBe(uriYarn2TestSciPnp.toString().toLowerCase());

        // Make sure we can load the medical dictionary.
        const dictLocationMed = resolveFrom(fsPath(uriYarn2TestMed), '@cspell/dict-medicalterms/cspell-ext.json');
        expect(dictLocationMed).toEqual(expect.stringContaining('cspell-ext.json'));

        // Make sure we can load the science dictionary.
        const dictLocationSci = resolveFrom(
            fsPath(uriYarn2TestSci),
            '@cspell/dict-scientific-terms-us/cspell-ext.json',
        );
        expect(dictLocationSci).toEqual(expect.stringContaining('cspell-ext.json'));
    });
});

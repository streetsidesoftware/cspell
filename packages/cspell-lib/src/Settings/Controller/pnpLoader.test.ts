import { clearPnPGlobalCache, pnpLoader } from './pnpLoader';
import { URI, Utils as UriUtils } from 'vscode-uri';
import resolveFrom from 'resolve-from';
import path from 'path';
import { UnsupportedPnpFile } from './ImportError';

const rootCspellLib = path.resolve(path.join(__dirname, '../../..'));
const root = path.resolve(rootCspellLib, '../..');
const uriTestPackages = URI.file(path.join(root, 'test-packages'));
const uriDirectory = URI.file(__dirname);
const uriYarn2TestMed = UriUtils.joinPath(uriTestPackages, 'yarn2/test-yarn3-med');
const uriYarn2TestSci = UriUtils.joinPath(uriTestPackages, 'yarn2/test-yarn3-sci');
const uriBadPnp = UriUtils.joinPath(uriDirectory, '../../../samples/bad-pnp');
const uriYarn2TestMedPnp = UriUtils.joinPath(uriYarn2TestMed, '.pnp.cjs');
const uriYarn2TestSciPnp = UriUtils.joinPath(uriYarn2TestSci, '.pnp.cjs');

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

        const yarnPnp = await loader.load(uriYarn2TestMed);
        expect(yarnPnp?.toString()).toBe(uriYarn2TestMedPnp.toString());
    });

    test('pnpLoader sync and async', async () => {
        const loader = pnpLoader();
        const yarnPnp = await loader.load(uriYarn2TestMed);
        expect(yarnPnp?.toString()).toBe(uriYarn2TestMedPnp.toString());
        expect(loader.peekSync(uriYarn2TestMed)?.toString()).toBe(yarnPnp?.toString());
        expect(loader.loadSync(uriYarn2TestMed)?.toString()).toBe(yarnPnp?.toString());

        const sciPnp = loader.loadSync(uriYarn2TestSci);
        await expect(loader.peek(uriYarn2TestSci)).resolves.toBe(sciPnp);
    });

    test('pnpLoader shared cache', async () => {
        const loader = pnpLoader();
        const yarnPnp = await loader.load(uriYarn2TestMed);
        expect(yarnPnp?.toString()).toBe(uriYarn2TestMedPnp.toString());

        // Check Shared cache
        const loader2 = pnpLoader();
        const yarnPnpPeek = await loader2.peek(uriYarn2TestMed);
        expect(yarnPnpPeek).toBe(yarnPnp);
    });

    test('pnpLoader multiple .pnp.js', async () => {
        const loader = pnpLoader();

        expect(await loader.peek(uriDirectory)).toBeUndefined();
        expect(await loader.load(uriDirectory)).toBeUndefined();

        const yarnPnpMed = await loader.load(uriYarn2TestMed);
        expect(yarnPnpMed?.toString()).toBe(uriYarn2TestMedPnp.toString());

        const yarnPnpSci = await loader.load(uriYarn2TestSci);
        expect(yarnPnpSci?.toString()).toBe(uriYarn2TestSciPnp.toString());

        // Make sure we can load the medical dictionary.
        const dictLocationMed = resolveFrom(uriYarn2TestMed.fsPath, '@cspell/dict-medicalterms/cspell-ext.json');
        expect(dictLocationMed).toEqual(expect.stringContaining(uriYarn2TestMed.fsPath));
        expect(dictLocationMed).toEqual(expect.stringContaining('cspell-ext.json'));

        // Make sure we can load the science dictionary.
        const dictLocationSci = resolveFrom(uriYarn2TestSci.fsPath, '@cspell/dict-scientific-terms-us/cspell-ext.json');
        expect(dictLocationSci).toEqual(expect.stringContaining(uriYarn2TestSci.fsPath));
        expect(dictLocationSci).toEqual(expect.stringContaining('cspell-ext.json'));
    });

    test('pnpLoader clear cache', async () => {
        const loader = pnpLoader();
        const yarnPnp = await loader.load(uriYarn2TestMed);
        expect(yarnPnp?.toString()).toBe(uriYarn2TestMedPnp.toString());

        await loader.clearCache();
        const yarnPnpPeek = await loader.peek(uriYarn2TestMed);
        expect(yarnPnpPeek).toBeUndefined();

        const yarnPnp2 = await loader.load(uriYarn2TestMed);
        expect(yarnPnp2?.toString()).toBe(yarnPnp?.toString());
        expect(yarnPnp2).not.toBe(yarnPnp);
    });

    test('pnpLoader pass 2', async () => {
        const loader = pnpLoader();

        expect(await loader.peek(uriDirectory)).toBeUndefined();
        expect(await loader.load(uriDirectory)).toBeUndefined();

        const yarnPnp = await loader.load(uriYarn2TestMed);
        expect(yarnPnp?.toString()).toBe(uriYarn2TestMedPnp.toString());

        // Make sure we can load the dictionary.
        const dictLocation = resolveFrom(uriYarn2TestMed.fsPath, '@cspell/dict-medicalterms/cspell-ext.json');
        expect(dictLocation).toEqual(expect.stringContaining(uriYarn2TestMed.fsPath));
        expect(dictLocation).toEqual(expect.stringContaining('cspell-ext.json'));
    });

    test('pnpLoader multiple clear cache', async () => {
        const loader = pnpLoader();
        const yarnPnp = await loader.load(uriYarn2TestMed);
        expect(yarnPnp?.toString()).toBe(uriYarn2TestMedPnp.toString());

        const loader2 = pnpLoader();
        const yarnPnp2 = await loader.load(uriYarn2TestSci);
        expect(yarnPnp2?.toString()).toBe(uriYarn2TestSciPnp.toString());

        // trigger two cache clears
        const cc = clearPnPGlobalCache();
        const cc1 = loader.clearCache();
        const cc2 = loader2.clearCache();
        // try and load before the cache clear is finished.
        const p = loader.load(uriYarn2TestMed);
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

        const yarnPnp = await loader.load(uriYarn2TestMed);
        const yarnPnp2 = await loader.load(UriUtils.joinPath(uriYarn2TestMed, '.yarn'));
        expect(yarnPnp?.toString()).toBe(uriYarn2TestMedPnp.toString());
        expect(yarnPnp2).toEqual(yarnPnp);
    });

    test('pnpLoader different files', async () => {
        const loaderA = pnpLoader();
        const loaderB = pnpLoader(['.not_found.js']);

        const yarnPnp = await loaderA.load(uriYarn2TestMed);
        const nfPnp = await loaderB.load(uriYarn2TestMed);
        expect(yarnPnp?.toString()).toBe(uriYarn2TestMedPnp.toString());
        expect(nfPnp).toBeUndefined();
    });

    test('pnpLoader bad schema', async () => {
        const loader = pnpLoader();
        const uri = uriYarn2TestMed.with({ scheme: 'ftp' });
        const r = loader.load(uri);
        await expect(r).resolves.toEqual(undefined);
    });
});

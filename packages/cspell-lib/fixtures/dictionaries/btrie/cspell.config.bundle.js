import configFromYaml from './cspell.config.yaml';

/**
 * A bundled cspell configuration for testing the bundled dictionary.
 * It uses tsdown to bundle the dictionary and then uses that bundle in unit tests.
 * See [tsdown.config.ts](../../../tsdown.config.ts) for the tsdown configuration.
 *
 * To update the bundle from `dist`, run `bash ./copy-bundle.sh`. See: [copy-bundle.sh](./copy-bundle.sh).
 */
const config = configFromYaml;

export default config;

const supportedExtensions = ['.json', '.jsonc', '.yaml', '.yml', '.mjs', '.cjs', '.js'];

/**
 * Logic of the locations:
 * - Support backward compatibility with the VS Code Spell Checker
 *   the spell checker extension can only write to `.json` files because
 *   it would be too difficult to automatically modify a `.js` or `.cjs` file.
 * - To support `cspell.config.js` in a VS Code environment, have a `cspell.json` import
 *   the `cspell.config.js`.
 */
const setOfLocations = new Set([
    'package.json',
    // Original locations
    '.cspell.json',
    'cspell.json',
    '.cSpell.json',
    'cSpell.json',
    // Original locations jsonc
    '.cspell.jsonc',
    'cspell.jsonc',
    // Alternate locations
    '.vscode/cspell.json',
    '.vscode/cSpell.json',
    '.vscode/.cspell.json',
    // Standard Locations
    '.cspell.config.json',
    '.cspell.config.jsonc',
    '.cspell.config.yaml',
    '.cspell.config.yml',
    'cspell.config.json',
    'cspell.config.jsonc',
    'cspell.config.yaml',
    'cspell.config.yml',
    // Dynamic config is looked for last
    ...genCfgLoc('cspell.config', supportedExtensions),
    ...genCfgLoc('.cspell.config', supportedExtensions),
    // .config
    '.cspell.yaml',
    '.cspell.yml',
    'cspell.yaml',
    'cspell.yml',
    '.config/.cspell.json',
    '.config/cspell.json',
    '.config/.cSpell.json',
    '.config/cSpell.json',
    '.config/.cspell.jsonc',
    '.config/cspell.jsonc',
    ...genCfgLoc('.config/cspell.config', supportedExtensions),
    ...genCfgLoc('.config/.cspell.config', supportedExtensions),
    '.config/cspell.yaml',
    '.config/cspell.yml',
]);

export const searchPlaces = Object.freeze([...setOfLocations]);

export const defaultConfigFilenames = Object.freeze([...searchPlaces]);

function genCfgLoc(filename: string, extensions: string[]) {
    return extensions.map((ext) => filename + ext);
}

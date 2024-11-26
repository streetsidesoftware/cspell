// @ts-check
export const name = 'name of extension';
/**
 * @param {import("./types.ts").Context} context
 * @param {unknown[]} params
 * @returns {Promise<import("@cspell/cspell-types").CSpellUserSettings>}
 */
export default async function getConfiguration(context, params) {
    return {
        name,
    };
}

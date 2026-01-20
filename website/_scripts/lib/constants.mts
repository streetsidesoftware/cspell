/**
 *
 */

/**
 * The current file URL to the site's package.json.
 */
export const URL_SITE_PKG: URL = new URL('../../package.json', import.meta.url);

/**
 * The current file URL to the repository's root package.json.
 */
export const URL_REPO_ROOT_PKG: URL = new URL('../../../package.json', import.meta.url);

/**
 * The current file URL to the site's src directory.
 */
export const URL_SITE_SRC: URL = new URL('src/', URL_SITE_PKG);

/**
 * The current file URL to the site's components directory.
 */
export const URL_SITE_COMPONENTS: URL = new URL('src/components/', URL_SITE_PKG);

/**
 * The current file URL to the site's docs directory.
 */
export const URL_SITE_DOCS: URL = new URL('docs/', URL_SITE_PKG);

/**
 * Binary data for CSpellVFS file.
 * This can be exported by a JavaScript based CSpell Configuration file.
 * @hidden
 */
export type CSpellVFSBinaryData = Uint8Array;

/**
 * Data content stored in a string for CSpellVFS file.
 * It is often encoded (e.g. base64) binary data.
 */
export type CSpellVFSTextData = string;

/**
 * The data content of a CSpellVFS file.
 */
export type CSpellVFSData = CSpellVFSBinaryData | CSpellVFSTextData;

/**
 * An entry in the CSpell Virtual File System.
 * It may or may not have a URL.
 * @since 9.7.0
 */
export interface CSpellVFSFileEntry {
    /**
     * The optional file vfs url. It is already part of the CSpellVFS key.
     */
    url?: CSpellVFSFileUrl;

    /**
     * The content data of the file.
     */
    data: CSpellVFSData;

    /**
     * The encoding of the data. In most cases the encoding is determined from the data type and filename url.
     */
    encoding?: 'base64' | 'plaintext' | 'utf8';
}

export interface CSpellVFSFile extends CSpellVFSFileEntry {
    /**
     * The file URL.
     */
    url: CSpellVFSFileUrl;
}

/**
 * A URL string representing a CSpellVFS file.
 * It should be of the form:
 *
 * ```txt
 * cspell-vfs:///<module>/<path-to-file>/<file-name>
 * ```
 *
 * Example: `cspell-vfs:///@cspell/dict-en_us/en_US.trie.gz`
 *
 * @since 9.7.0
 */
export type CSpellVFSFileUrl = string;

/**
 * A declaration of files to add to the CSpell Virtual File System.
 * @since 9.7.0
 * @stability experimental
 */
export type CSpellVFS = Record<CSpellVFSFileUrl, CSpellVFSFileEntry>;

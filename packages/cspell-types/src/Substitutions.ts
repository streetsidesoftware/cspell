/**
 * The ID for a substitution definition. This is used to reference the substitution definition in the substitutions array.
 * @since 9.7.0
 */
export type SubstitutionID = string;

/**
 * A substitution entry is a tuple of the form `[find, replacement]`. The find string is the string to find,
 * and the replacement string is the string to replace it with.
 *
 * - `find` - The string to find. This is the string that will be replaced in the text. Only an exact match will be replaced.
 *   The find string is not treated as a regular expression.
 * - `replacement` - The string to replace the `find` string with. This is the string that will be used to replace the `find`
 *   string in the text.
 *
 * @since 9.7.0
 */
export type SubstitutionEntry = [find: string, replacement: string];

/**
 * Allows for the definition of a substitution set. A substitution set is a collection of substitution
 * entries that can be applied to a document before spell checking. This is useful for converting html entities, url encodings,
 * or other transformations that may be necessary to get the correct text for spell checking.
 *
 * Substitutions are applied based upon the longest matching find string. If there are multiple matches of the same `find`,
 * the last one in the list is used. This allows for the overriding of substitutions. For example, if you have a substitution
 * for `&` to `and`, and then a substitution for `&amp;` to `&`, the `&amp;` substitution will be used for the string `&amp;`,
 * and the `&` substitution will be used for the string `&`.
 *
 * @since 9.7.0
 */
export interface SubstitutionDefinition {
    id: SubstitutionID;
    description?: string;
    entries: SubstitutionEntry[];
}

/**
 * The set of available substitutions. This is a collection of substitution definitions that can be applied to a document
 * before spell checking.
 */
export type SubstitutionDefinitions = SubstitutionDefinition[];

export interface SubstitutionDefinitionMap {
    [id: SubstitutionID]: SubstitutionDefinition;
}

/**
 * The set of substitutions to apply to a document before spell checking.
 * This is a collection of substitution entries that can be applied to a document before spell checking.
 */
export type Substitutions = (SubstitutionEntry | SubstitutionID)[];

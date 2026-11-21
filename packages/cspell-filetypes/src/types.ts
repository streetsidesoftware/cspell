export type FileTypeId = string;

export interface FileTypeExtensionDefinition {
    id: FileTypeId;
    /** List of extensions starting with '.' */
    extensions: string[];
    /**
     * Filenames that do not have an extension or have a different type than their implied extension.
     *
     * A filename with a `/` matches the end of a path, for example `.git/config`. In it, `*` stays within one path
     * segment, and `**` crosses segments.
     */
    filenames?: string[];
    /** Indicates that it is a Text or Binary file type. */
    format?: 'Text' | 'Binary';
    /** Optional Description */
    description?: string;
    /** Optional Comment */
    comment?: string;
}

export type FileTypeDefinition = FileTypeExtensionDefinition;
export type FileTypeDefinitions = FileTypeDefinition[];

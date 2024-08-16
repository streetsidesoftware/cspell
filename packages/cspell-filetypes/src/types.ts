export type FileTypeId = string;

export interface FileTypeExtensionDefinition {
    id: FileTypeId;
    /** List of extensions starting with '.' */
    extensions: string[];
    /** Filenames that do not have an extension or have a different type than their implied extension */
    filenames?: (string | RegExp)[];
    /** Indicates that it is a Text or Binary file type. */
    format?: 'Text' | 'Binary';
    /** Optional Description */
    description?: string;
    /** Optional Comment */
    comment?: string;
}

export type FileTypeDefinition = FileTypeExtensionDefinition;
export type FileTypeDefinitions = FileTypeDefinition[];

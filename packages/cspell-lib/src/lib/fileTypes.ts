export type { FileTypeId, FileTypeId as LanguageId } from '@cspell/filetypes';
export {
    getFileTypesForExt as getLanguagesForExt,
    findMatchingFileTypes as getLanguagesForFilename,
    isFileTypeGenerated as isGenerated,
} from '@cspell/filetypes';

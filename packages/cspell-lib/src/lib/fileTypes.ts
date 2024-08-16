export type { FileTypeId, FileTypeId as LanguageId } from '@cspell/filetypes';
export {
    findMatchingFileTypes as getLanguagesForBasename,
    getFileTypesForExt as getLanguagesForExt,
    isFileTypeGenerated as isGenerated,
} from '@cspell/filetypes';

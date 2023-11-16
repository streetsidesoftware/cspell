import type { CSpellConfigFileReference, ICSpellConfigFile } from './CSpellConfigFile.js';

export interface ConfigReadWriteHandler {
    read(
        ref: CSpellConfigFileReference,
        next: (ref: CSpellConfigFileReference) => Promise<ICSpellConfigFile>,
    ): Promise<ICSpellConfigFile>;
    write?: (
        configFile: ICSpellConfigFile,
        next: (configFile: ICSpellConfigFile) => Promise<CSpellConfigFileReference>,
    ) => Promise<CSpellConfigFileReference>;
}

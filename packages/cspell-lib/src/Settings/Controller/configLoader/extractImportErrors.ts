import type { ImportFileRef } from '@cspell/cspell-types';

import type { CSpellSettingsWST } from './types';

export function extractImportErrors(settings: CSpellSettingsWST): ImportFileRefWithError[] {
    const imports = mergeImportRefs(settings);
    return !imports ? [] : [...imports.values()].filter(isImportFileRefWithError);
}
type Imports = CSpellSettingsWST['__imports'];
function mergeImportRefs(left: CSpellSettingsWST, right: CSpellSettingsWST = {}): Imports {
    const imports = new Map(left.__imports || []);
    if (left.__importRef) {
        imports.set(left.__importRef.filename, left.__importRef);
    }
    if (right.__importRef) {
        imports.set(right.__importRef.filename, right.__importRef);
    }
    const rightImports = right.__imports?.values() || [];
    for (const ref of rightImports) {
        imports.set(ref.filename, ref);
    }
    return imports.size ? imports : undefined;
}

export interface ImportFileRefWithError extends ImportFileRef {
    error: Error;
}
function isImportFileRefWithError(ref: ImportFileRef): ref is ImportFileRefWithError {
    return !!ref.error;
}

import type { PartialWithUndefined } from '../types.ts';
import type { CompoundModes } from './CompoundModes.ts';

export interface FindOptions {
    matchCase: boolean;
    compoundMode: CompoundModes;
    legacyMinCompoundLength?: number | undefined;
    checkForbidden?: boolean | undefined;
    compoundSeparator?: string | undefined;
}

export type PartialFindOptions = PartialWithUndefined<FindOptions> | undefined;

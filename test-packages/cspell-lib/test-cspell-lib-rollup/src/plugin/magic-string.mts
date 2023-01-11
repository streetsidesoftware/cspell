/* eslint-disable @typescript-eslint/no-misused-new */
import type { MagicStringOptions, SourceMap, SourceMapOptions, UpdateOptions } from 'magic-string';
import MS from 'magic-string';

export interface MagicString {
    new (str: string, options?: MagicStringOptions): MagicString;
    generateMap(options?: SourceMapOptions): SourceMap;
    /**
     * Appends the specified content at the index in the original string.
     * If a range *ending* with index is subsequently moved, the insert will be moved with it.
     * See also `s.prependLeft(...)`.
     */
    appendLeft(index: number, content: string): MagicString;
    toString(): string;
}
export const MagicString = MS as unknown as MagicString;

export default MagicString;

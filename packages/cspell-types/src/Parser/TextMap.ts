import type { Mapped } from './Mapped.js';

export type MappedText = Readonly<TransformedText>;

interface TransformedText extends Mapped {
    /**
     * Transformed text with an optional map.
     */
    text: string;

    /**
     * The original text
     */
    rawText?: string | undefined;
}

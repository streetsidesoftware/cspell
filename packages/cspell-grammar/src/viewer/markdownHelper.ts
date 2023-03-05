import { escapeMarkdown } from './escapeMarkdown.js';

export function toInlineCode(text: string): string {
    return `<code>${escapeMarkdown(text.replace(/\r/g, '↤').replace(/\n/g, '↩'))}</code>`;
}

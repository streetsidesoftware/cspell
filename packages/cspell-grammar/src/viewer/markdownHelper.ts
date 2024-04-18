import { escapeMarkdown } from './escapeMarkdown.js';

export function toInlineCode(text: string): string {
    return `<code>${escapeMarkdown(text.replaceAll('\r', '↤').replaceAll('\n', '↩'))}</code>`;
}

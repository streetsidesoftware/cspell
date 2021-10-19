import { escapeMarkdown } from './escapeMarkdown';

export function toInlineCode(text: string): string {
    return `<code>${escapeMarkdown(text.replace(/\r/g, '↤').replace(/\n/g, '↩'))}</code>`;
}

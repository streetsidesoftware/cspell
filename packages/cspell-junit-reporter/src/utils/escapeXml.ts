// Control characters that should not appear literally in XML 1.0 output
// (tab \t, newline \n, and carriage return \r are allowed).
// eslint-disable-next-line no-control-regex
const invalidXmlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F]/g;

/**
 * Escapes text so it is safe to embed inside an XML element's text content.
 */
export function escapeXmlText(value: string): string {
    return value
        .replaceAll(invalidXmlChars, '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

/**
 * Escapes text so it is safe to embed inside a double-quoted XML attribute value.
 */
export function escapeXmlAttribute(value: string): string {
    return value
        .replaceAll(invalidXmlChars, '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;'); // cspell:ignore apos
}

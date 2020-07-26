// Exclude Expressions
// cSpell:ignore anrvtbf
export const regExMatchUrls = /(?:https?|ftp):\/\/[^\s"]+/gi;
export const regExHRef = /\bhref\s*=\s*".*?"/gi;
export const regExHexDigits = /^x?[0-1a-f]+$/i;
export const regExMatchCommonHexFormats = /(?:#[0-9a-f]{3,8})|(?:0x[0-9a-f]+)|(?:\\u[0-9a-f]{4})|(?:\\x\{[0-9a-f]{4}\})/gi;
// tslint:disable-next-line
export const regExSpellingGuard = /(?:(?:spell-?checker|cSpell)::?\s*disable(?!-line|-next)\b[\s\S]*?(?:(?:spell-?checker|cSpell)::?\s*enable\b|$))|(?:.*(?:spell-?checker|cSpell)::?\s*disable-line\b.*)|(?:(?:spell-?checker|cSpell)::?\s*disable-next\b.*\r?\n.*\r?\n)/gi;
export const regExSpellingGuardBlock = /(\bc?spell(?:-?checker)?::?)\s*disable(?!-line|-next)\b[\s\S]*?((?:\1\s*enable\b)|$)/gi;
export const regExSpellingGuardNext = /\bc?spell(?:-?checker)?::?\s*disable-next\b.*\s.*/gi;
export const regExSpellingGuardLine = /^.*\bc?spell(?:-?checker)?::?\s*disable-line\b.*/gim;
export const regExPublicKey = /BEGIN\s+((?:RSA\s+)?PUBLIC)\s+KEY(?:[\w=+\-\/]*\r?\n)+?-*END\s+\1/g;
export const regExCert = /BEGIN\s+(CERTIFICATE|RSA\s+(?:PRIVATE|PUBLIC)\s+KEY)(?:[\w=+\-\/]*\r?\n)+?-*END\s+\1/g;
export const regExEscapeCharacters = /\\(?:[anrvtbf]|[xu][a-f0-9]+)/gi;
export const regExBase64 = /(?:[a-z0-9\/+]{40,})(?:\s^\s*[a-z0-9\/+]{40,})*(?:\s^\s*[a-z0-9\/+]+=*)?/gim;

// Include Expressions
export const regExPhpHereDoc = /<<<['"]?(\w+)['"]?[\s\S]+?^\1;/gm;
export const regExString = /(?:(['"]).*?(?<![^\\]\\(\\\\)*)\1)|(?:`[\s\S]*?(?<![^\\]\\(\\\\)*)`)/g;

// Note: the C Style Comments incorrectly considers '/*' and '//' inside of strings as comments.
export const regExCStyleComments = /(?:\/\/.*)|(?:\/\*[\s\S]+?\*\/)/g;
export const rexExPythonStyleComments = /#.*|(?:('''|""")[^\1]+?\1)/gm;

export const regExEmail = /<?[\w.\-+]+@\w+(\.\w+)+>?/gi;

export const regExRepeatedChar = /^(\w)\1{3,}$/;

// cSpell:ignore bsha
export const regExSha = /\bsha\d+-[a-z0-9+\/=]+/gi;

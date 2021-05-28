// Exclude Expressions
// cSpell:ignore anrvtbf
export const regExMatchUrls = /(?:https?|ftp):\/\/[^\s"]+/gi;
export const regExHRef = /\bhref\s*=\s*".*?"/gi;
export const regExMatchCommonHexFormats =
    /(?:#[0-9a-f]{3,8})|(?:0x[0-9a-f]+)|(?:\\u[0-9a-f]{4})|(?:\\x\{[0-9a-f]{4}\})/gi;
export const regExCommitHash = /\b(?![a-f]+\b)(?:0x)?[0-9a-f]{7,}\b/gi; // Match Commit Hashes that contain at least one digit.
export const regExCStyleHexValue = /\b0x[0-9a-f]+\b/gi;
export const regExCSSHexValue = /#[0-9a-f]{3,8}\b/gi;
export const regExUUID = /\b[0-9a-fx]{8}-[0-9a-fx]{4}-[0-9a-fx]{4}-[0-9a-fx]{4}-[0-9a-fx]{12}\b/gi; // x - represents placeholder values
export const regExUnicodeRef = /\bU\+[0-9a-f]{4,5}(?:-[0-9a-f]{4,5})?/gi;
export const regExSpellingGuardBlock =
    /(\bc?spell(?:-?checker)?::?)\s*disable(?!-line|-next)\b[\s\S]*?((?:\1\s*enable\b)|$)/gi;
export const regExSpellingGuardNext = /\bc?spell(?:-?checker)?::?\s*disable-next\b.*\s\s?.*/gi;
export const regExSpellingGuardLine = /^.*\bc?spell(?:-?checker)?::?\s*disable-line\b.*/gim;
export const regExIgnoreSpellingDirectives = /\bc?spell(?:-?checker)?::?\s*ignoreRegExp.*/gim;
export const regExPublicKey = /BEGIN\s+((?:RSA\s+)?PUBLIC)\s+KEY(?:[\w=+\-/]*\r?\n)+?-*END\s+\1/g;
export const regExCert = /BEGIN\s+(CERTIFICATE|RSA\s+(?:PRIVATE|PUBLIC)\s+KEY)(?:[\w=+\-/]*\r?\n)+?-*END\s+\1/g;
export const regExEscapeCharacters = /\\(?:[anrvtbf]|[xu][a-f0-9]+)/gi;
export const regExBase64 = /(?<![a-z0-9/+])(?:[a-z0-9/+]{40,})(?:\s^\s*[a-z0-9/+]{40,})*(?:\s^\s*[a-z0-9/+]+=*)?/gim;

// cspell:ignore aeiou
// The following is an attempt at detecting random strings.
// export const regExRandomString =
//     /\b(?=\w*(?:[A-Z]{2}|[A-Z][a-z][A-Z]|\d\w\d))(?=(?:\w*[A-Z]){2})(?=(?:\w*[a-z]){2})(?=\w*[^aeiouAEIOU\W]{4})[\w]{10,}\b/g;

// Include Expressions
export const regExPhpHereDoc = /<<<['"]?(\w+)['"]?[\s\S]+?^\1;/gm;
export const regExString = /(?:(['"]).*?(?<![^\\]\\(\\\\)*)\1)|(?:`[\s\S]*?(?<![^\\]\\(\\\\)*)`)/g;

// Note: the C Style Comments incorrectly considers '/*' and '//' inside of strings as comments.
export const regExCStyleComments = /(?<!\w:)(?:\/\/.*)|(?:\/\*[\s\S]*?\*\/)/g;
export const rexExPythonStyleComments = /#.*|(?:('''|""")[^\1]+?\1)/gm;

export const regExEmail = /<?\b[\w.\-+]{1,128}@\w{1,63}(\.\w{1,63}){1,4}\b>?/gi;

export const regExRepeatedChar = /^(\w)\1{3,}$/i;

// cSpell:ignore bsha
export const regExSha = /\bsha\d+-[a-z0-9+/=]+/gi;

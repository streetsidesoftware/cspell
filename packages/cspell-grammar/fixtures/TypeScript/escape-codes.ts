const places = ['Amsterdam', 'Orl\xe9ans'];

const sample = {
    text: 'Fingerspitzengefühl is a German term.\nIt’s pronounced as follows: [ˈfɪŋɐˌʃpɪtsənɡəˌfyːl]',
    hex: '\x46\x69\x6E\x67\x65\x72\x73\x70\x69\x74\x7A\x65\x6E\x67\x65\x66\xFC\x68\x6C\x20\x69\x73\x20\
\x61\x20\x47\x65\x72\x6D\x61\x6E\x20\x74\x65\x72\x6D\x2E\n\x49\x74\u2019\x73\x20\x70\x72\x6F\x6E\x6F\x75\x6E\
\x63\x65\x64\x20\x61\x73\x20\x66\x6F\x6C\x6C\x6F\x77\x73\x3A\x20\x5B\u02C8\x66\u026A\u014B\u0250\u02CC\u0283\
\x70\u026A\x74\x73\u0259\x6E\u0261\u0259\u02CC\x66\x79\u02D0\x6C\x5D',
    mixed: 'Fingerspitzengef\xFChl is a German term.\nIt\u2019s pronounced as follows: \
[\u02C8f\u026A\u014B\u0250\u02CC\u0283p\u026Ats\u0259n\u0261\u0259\u02CCfy\u02D0l]',
};

console.log(places);
console.log('%o', sample);

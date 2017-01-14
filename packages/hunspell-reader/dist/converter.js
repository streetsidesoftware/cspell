"use strict";
const regexSpecialCharacters = /[|\\{}()[\]^$+*?.]/g;
class Converter {
    constructor(convList) {
        const match = convList.map(({ from }) => from.replace(regexSpecialCharacters, '\\$&')).join('|');
        this._match = new RegExp(match, 'g');
        this._map = Object.create(null);
        convList.reduce((map, { from, to }) => { map[from] = to; return map; }, this._map);
    }
    convert(input) {
        return input.replace(this._match, (m) => {
            return this._map[m] || '';
        });
    }
}
exports.Converter = Converter;
//# sourceMappingURL=converter.js.map
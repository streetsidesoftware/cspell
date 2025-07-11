import type { Dictionary } from './types.js';

export interface ConvItem {
    from: string;
    to: string;
}

const regexSpecialCharacters = /[|\\{}()[\]^$+*?.]/g;

export class Converter {
    private _match: RegExp;
    private _map: Dictionary<string>;

    constructor(convList: ConvItem[]) {
        const match = convList.map(({ from }) => from.replaceAll(regexSpecialCharacters, '\\$&')).join('|');
        this._match = new RegExp(match, 'g');
        this._map = Object.create(null);
        convList.reduce((map, { from, to }) => {
            map[from] = to;
            return map;
        }, this._map);
    }

    convert = (input: string): string => {
        return input.replace(this._match, (m) => {
            return this._map[m] || '';
        });
    };
}

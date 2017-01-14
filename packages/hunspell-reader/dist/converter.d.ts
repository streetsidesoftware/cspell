export interface ConvItem {
    from: string;
    to: string;
}
export declare class Converter {
    private _match;
    private _map;
    constructor(convList: ConvItem[]);
    convert(input: string): string;
}

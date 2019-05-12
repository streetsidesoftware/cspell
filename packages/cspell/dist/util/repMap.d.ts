import { ReplaceMap } from '../Settings';
export declare type ReplaceMapper = (src: string) => string;
export declare function createMapper(repMap: ReplaceMap): ReplaceMapper;

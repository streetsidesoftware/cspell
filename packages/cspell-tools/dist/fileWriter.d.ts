/// <reference types="node" />
import * as fs from 'fs';
import * as Rx from 'rxjs/Rx';
export declare function writeToFile(filename: string, data: string): fs.WriteStream;
export declare function writeToFileRx(filename: string, data: Rx.Observable<string>): fs.WriteStream;
export declare function writeToFileRxP(filename: string, data: Rx.Observable<string>): Promise<void>;

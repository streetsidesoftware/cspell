import { assert } from '../utils/assert.ts';
import { endianness } from '../utils/endian.ts';

const isLittleEndian: boolean = endianness() === 'LE';

export interface FormatElement {
    /** name of the element */
    name: string;
    /** the description of the element */
    description: string;
    /** the type of element */
    type: 'string' | 'uint32' | 'ptrUint32Array';
    /** offset in bytes */
    offset: number;
    /** size in bytes */
    size: number;

    /** An expected value */
    value?: Uint8Array | undefined;
}

export class BinaryFormatBuilder {
    #elements: FormatElement[] = [];
    #offset = 0;
    #textEncoder = new TextEncoder();

    addUint32(name: string, description: string, value?: number): BinaryFormatBuilder {
        const offset = (this.#offset + 3) & ~3; // align to 4 bytes
        const uValue = value !== undefined ? rawNumberToUint32Array(value) : 0;
        this.#elements.push({
            name,
            description,
            type: 'uint32',
            offset,
            size: 4,
            value: uValue ? new Uint8Array(uValue.buffer, uValue.byteOffset, uValue.byteLength) : undefined,
        });
        this.#offset = offset + 4;
        return this;
    }

    /**
     * A pointer to a uint32 array, it has two parts, the offset and the length.
     * @param name - name of pointer
     * @param description -
     * @returns this
     */
    addPtrUint32Array(name: string, description: string): BinaryFormatBuilder {
        const offset = (this.#offset + 3) & ~3; // align to 4 bytes
        this.#elements.push({
            name,
            description,
            type: 'ptrUint32Array',
            offset,
            size: 8,
            value: undefined,
        });
        this.#offset = offset + 8;
        return this;
    }

    addString(name: string, description: string, length: number | string): BinaryFormatBuilder {
        const value = typeof length === 'string' ? this.#textEncoder.encode(length) : undefined;
        let size = value?.length || 0;
        size = typeof length === 'number' ? length : size;
        this.#elements.push({
            name,
            description,
            type: 'string',
            offset: this.#offset,
            size,
            value,
        });
        this.#offset += size;
        return this;
    }

    build(): BinaryFormat {
        return new BinaryFormat([...this.#elements]);
    }
}

export class BinaryFormat {
    readonly elements: FormatElement[];
    #fieldsByName: Map<string, FormatElement> = new Map();
    #offset: number;

    constructor(elements: FormatElement[]) {
        this.elements = elements;
        this.#fieldsByName = new Map(elements.map((el) => [el.name, el] as const));
        this.#offset = Math.max(...elements.map((el) => el.offset + el.size), 0);
    }

    get size(): number {
        return this.#offset;
    }

    getField(name: string): FormatElement | undefined {
        return this.#fieldsByName.get(name);
    }

    toJSON(): unknown {
        return this.elements;
    }

    toString(): string {
        const nameWidth = Math.max('name'.length, ...this.elements.map((el) => el.name.length), 'name'.length);
        const offsetWidth = 8;
        const sizeWidth = 6;
        const typeWidth = Math.max('type'.length, ...this.elements.map((el) => el.type.length), 'type'.length);
        const lines: string[] = [];

        addHeaderLines();
        this.elements.forEach(addLine);

        return lines.join('\n');

        function addHeaderLines(): void {
            const name = 'name'.padEnd(nameWidth, ' ');
            const offset = 'offset'.padEnd(offsetWidth, ' ');
            const size = 'size'.padEnd(sizeWidth, ' ');
            const type = 'type'.padEnd(typeWidth, ' ');
            const line = `${name} ${offset} ${size} ${type} description (value)`;
            lines.push('Binary Format:');
            lines.push(line);
            lines.push('-'.repeat(line.length));
        }

        function addLine(e: FormatElement): void {
            const name = e.name.padEnd(nameWidth, ' ');
            const offset = e.offset.toString().padStart(offsetWidth, ' ');
            const size = e.size.toString().padStart(sizeWidth, ' ');
            const type = e.type.padEnd(typeWidth, ' ');
            const description = e.description;
            const value = e.value !== undefined ? `(${e.value})` : '';
            lines.push(`${name} ${offset} ${size} ${type} ${description} ${value}`.trim());
        }
    }
}

export interface DataElement {
    name: string;
    offset: number;
    size: number;
    data: Uint8Array;
    ref?: FormatElement | undefined;
}

export interface DataElementWithRef extends DataElement {
    ref: FormatElement;
}

export class BinaryDataBuilder {
    #dataElementMap: Map<string, DataElement> = new Map();
    #offset = 0;
    #endian: 'LE' | 'BE';
    #useLE: boolean;
    #encoder = new TextEncoder();
    readonly format: BinaryFormat;

    constructor(format: BinaryFormat, endian: 'LE' | 'BE' = endianness()) {
        this.format = format;
        this.#offset = format.size;
        this.#endian = endian;
        this.#useLE = endian === 'LE';
        this.#dataElementMap = new Map();
        this.#populateDataElementMap();
    }

    #populateDataElementMap() {
        for (const ref of this.format.elements) {
            const { name, offset, size } = ref;
            const data = new Uint8Array(size);
            if (ref.value) {
                data.set(ref.value);
            }
            const de: DataElement = { name, offset, size, data, ref };
            this.#dataElementMap.set(de.name, de);
            this.#offset = Math.max(this.#offset, offset + size);
        }
    }

    setString(name: string, value: string): BinaryDataBuilder {
        const element = this.getDataElement(name);
        assert(element, `Field not found: ${name}`);
        const formatElement = element.ref;
        assert(formatElement, `Field Format not found: ${name}`);
        assert(formatElement.type === 'string', `Field is not a string: ${name}`);

        this.#encoder.encodeInto(value, element.data);
        return this;
    }

    setUint32(name: string, value: number): BinaryDataBuilder {
        const element = this.getDataElement(name);
        assert(element, `Field not found: ${name}`);
        const formatElement = element.ref;
        assert(formatElement, `Field Format not found: ${name}`);
        assert(formatElement.type === 'uint32', `Field is not a uint32: ${name}`);

        const view = new DataView(element.data.buffer, element.data.byteOffset, element.data.byteLength);
        const useLittle = this.#endian === 'LE';
        view.setUint32(0, value, useLittle);

        return this;
    }

    addDataElement(data: Uint8Array): DataElement {
        const offset = (this.#offset + 3) & ~3; // align to 4 bytes
        const name = `data_${offset}`;
        const size = data.byteLength;
        const de: DataElement = { name, offset, size, data };
        this.#dataElementMap.set(de.name, de);
        this.#offset = offset + size;
        return de;
    }

    setPtrUint32Array(name: string, data: Uint32Array): BinaryDataBuilder {
        const element = this.getDataElement(name);
        assert(element, `Field not found: ${name}`);
        const formatElement = element.ref;
        assert(formatElement, `Field Format not found: ${name}`);
        assert(formatElement.type === 'ptrUint32Array', `Field is not a ptrUint32Array: ${name}`);

        const de = this.addDataElement(covertUint32ArrayToUint8Array(data, this.#useLE));
        const view = new DataView(element.data.buffer, element.data.byteOffset, element.data.byteLength);
        view.setUint32(0, de.offset, this.#useLE);
        view.setUint32(4, de.size, this.#useLE);
        return this;
    }

    get offset(): number {
        return this.#offset;
    }

    get endian(): 'LE' | 'BE' {
        return this.#endian;
    }

    getDataElement(name: string): DataElement | undefined {
        return this.#dataElementMap.get(name);
    }

    build(): Uint8Array {
        const buffer = new Uint8Array(this.#offset);
        for (const element of this.#dataElementMap.values()) {
            buffer.set(element.data, element.offset);
        }
        return buffer;
    }
}

export function convertUint32ArrayEndiannessInPlace(data: Uint32Array): Uint32Array {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const byteLength = data.length * 4;
    for (let i = 0; i < byteLength; i += 4) {
        const v = view.getUint32(i, true);
        view.setUint32(i, v, false);
    }
    return data;
}

export function covertUint32ArrayToUint8Array(
    data: Uint32Array,
    useLittle: boolean,
    isLE: boolean = isLittleEndian,
): Uint8Array {
    if (isLE === useLittle) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }

    const target = new Uint32Array(data.length);
    target.set(data);
    convertUint32ArrayEndiannessInPlace(target);
    return new Uint8Array(target.buffer, target.byteOffset, target.byteLength);
}

function rawNumberToUint32Array(value: number): Uint32Array {
    return new Uint32Array([value]);
}

export class BinaryDataReader {
    readonly data: Uint8Array;
    readonly format: BinaryFormat;
    #decoder = new TextDecoder();
    #useLE: boolean;

    /**
     * Binary Data Reader
     * @param data - the raw binary data
     * @param format - the expected format
     * @param endian - the endian of the data (can be changed later)
     */
    constructor(data: Uint8Array, format: BinaryFormat, endian: 'LE' | 'BE' = endianness()) {
        this.data = data;
        this.format = format;
        this.#useLE = endian === 'LE';
    }

    getString(name: string): string {
        const element = this.getDataElement(name);
        const formatElement = element.ref;
        assert(formatElement.type === 'string', `Field is not a string: ${name}`);
        return this.#decoder.decode(element.data);
    }

    getUint32(name: string): number {
        const element = this.getDataElement(name);
        const formatElement = element.ref;
        assert(formatElement.type === 'uint32', `Field is not a uint32: ${name}`);
        const view = new DataView(element.data.buffer, element.data.byteOffset, element.data.byteLength);
        return view.getUint32(0, this.#useLE);
    }

    getPtrUint32Array(name: string): Uint32Array {
        const element = this.getDataElement(name);
        const formatElement = element.ref;
        assert(formatElement.type === 'ptrUint32Array', `Field is not a ptrUint32Array: ${name}`);
        const view = new DataView(element.data.buffer, element.data.byteOffset, element.data.byteLength);
        const offset = view.getUint32(0, this.#useLE);
        const length = view.getUint32(4, this.#useLE);
        const arrData = this.data.subarray(offset, offset + length);
        const rawData32 = new Uint32Array(arrData.buffer, arrData.byteOffset, arrData.byteLength / 4);
        if (isLittleEndian === this.#useLE) {
            return rawData32;
        }
        const data = new Uint32Array(rawData32);
        return convertUint32ArrayEndiannessInPlace(data);
    }

    getDataElement(name: string): DataElementWithRef {
        const element = this.format.getField(name);
        assert(element, `Field not found: ${name}`);
        const data = this.data.subarray(element.offset, element.offset + element.size);
        return {
            name: element.name,
            offset: element.offset,
            size: element.size,
            data,
            ref: element,
        };
    }

    set endian(endian: 'LE' | 'BE') {
        this.#useLE = endian === 'LE';
    }

    reverseEndian(): void {
        this.#useLE = !this.#useLE;
    }
}

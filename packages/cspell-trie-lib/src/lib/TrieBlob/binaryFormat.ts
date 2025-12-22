import { assert } from '../utils/assert.ts';
import { endianness } from '../utils/endian.ts';

const isLittleEndian: boolean = endianness() === 'LE';

export type FormatType = 'string' | 'uint32' | 'ptrUint32Array' | 'ptrUint8Array' | 'ptrString';

const knownStringTypes: Set<FormatType> = new Set(['string', 'ptrString', 'ptrUint8Array']);

export interface FormatElement {
    /** name of the element */
    name: string;
    /** the description of the element */
    description: string;
    /** the type of element */
    type: FormatType;
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
        const bValue = uValue ? new Uint8Array(uValue.buffer, uValue.byteOffset, uValue.byteLength) : undefined;
        this.#elements.push({ name, description, type: 'uint32', offset, size: 4, value: bValue });
        this.#offset = offset + 4;
        return this;
    }

    /**
     * A pointer to a uint32 array, it has two parts, the offset and the length.
     * @param name - name of pointer
     * @param description -
     * @returns this
     */
    addUint32ArrayPtr(name: string, description: string): BinaryFormatBuilder {
        return this.addPointer('ptrUint32Array', name, description);
    }

    /**
     * A pointer to a uint8 array, it has two parts, the offset and the length.
     * @param name - name of pointer
     * @param description -
     * @returns this
     */
    addUint8ArrayPtr(name: string, description: string): BinaryFormatBuilder {
        return this.addPointer('ptrUint8Array', name, description);
    }

    /**
     * A pointer to a uint8 array, it has two parts, the offset and the length.
     * @param name - name of pointer
     * @param description -
     * @returns this
     */
    addStringPtr(name: string, description: string): BinaryFormatBuilder {
        return this.addPointer('ptrString', name, description);
    }

    addPointer(
        type: 'ptrUint32Array' | 'ptrUint8Array' | 'ptrString',
        name: string,
        description: string,
    ): BinaryFormatBuilder {
        const offset = (this.#offset + 3) & ~3; // align to 4 bytes
        this.#elements.push({ name, description, type, offset, size: 8, value: undefined });
        this.#offset = offset + 8;
        return this;
    }

    addString(name: string, description: string, length: number | string): BinaryFormatBuilder {
        const value = typeof length === 'string' ? this.#textEncoder.encode(length) : undefined;
        let size = value?.length || 0;
        size = typeof length === 'number' ? length : size;
        this.#elements.push({ name, description, type: 'string', offset: this.#offset, size, value });
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
        return this.elements.map(formatElementToJSON);
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
            const offset = 'offset'.padStart(offsetWidth, ' ');
            const size = 'size'.padStart(sizeWidth, ' ');
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

export type ByteAlignment = 1 | 2 | 4 | 8;

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

        const r = this.#encoder.encodeInto(value, element.data);
        assert(r.read === value.length, `String too long for field ${name}: ${value}`);
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

    /**
     * Adjust the offset so it lands on the alignment boundary.
     * 1 = byte align
     * 2 = 16bit align
     * 4 = 32bit align
     * 8 = 64bit align
     * @param alignment - the byte alignment
     */
    alignTo(alignment: ByteAlignment): void {
        const aMask = alignment - 1;
        this.#offset = (this.#offset + aMask) & ~aMask; // align to alignment bytes
    }

    /**
     * Append a data element to the binary data.
     * @param data - the data to add
     * @returns the DataElement added
     */
    addDataElement(data: Uint8Array, alignment: ByteAlignment): DataElement {
        this.alignTo(alignment);
        const offset = this.#offset;
        const name = `data_${offset}`;
        const size = data.byteLength;
        const de: DataElement = { name, offset, size, data };
        this.#dataElementMap.set(de.name, de);
        this.#offset = offset + size;
        return de;
    }

    /**
     * Append the data and set the pointer to it.
     * The Uint32Array  will be converted to the proper endianness if necessary.
     * @param name - name of the pointer field
     * @param data - the data to add
     * @param alignment - the alignment for the data, default 4
     * @returns this
     */
    setPtrUint32Array(name: string, data: Uint32Array, alignment: ByteAlignment = 4): BinaryDataBuilder {
        return this.#setPtrData(name, 'ptrUint32Array', covertUint32ArrayToUint8Array(data, this.#useLE), alignment);
    }

    /**
     * Append the data and set the pointer to it.
     * @param name - name of the pointer field
     * @param data - the data to add
     * @param alignment - the alignment for the data, default 1
     * @returns this
     */
    setPtrUint8Array(name: string, data: Uint8Array, alignment: ByteAlignment = 1): BinaryDataBuilder {
        return this.#setPtrData(name, 'ptrUint8Array', data, alignment);
    }

    /**
     * Append the string and set the pointer to it. It will be encoded as UTF-8.
     * Note: the alignment is 1. Use alignTo() if you need a different alignment.
     * @param name - name of the pointer field
     * @param str - the data to add
     * @returns this
     */
    setPtrString(name: string, str: string): BinaryDataBuilder {
        return this.#setPtrData(name, 'ptrString', this.#encoder.encode(str), 1);
    }

    #setPtrData(
        name: string,
        fType: 'ptrUint32Array' | 'ptrUint8Array' | 'ptrString',
        data: Uint8Array,
        alignment: ByteAlignment,
    ): this {
        const element = this.getDataElement(name);
        assert(element, `Field not found: ${name}`);
        const formatElement = element.ref;
        assert(formatElement, `Field Format not found: ${name}`);
        assert(formatElement.type === fType, `Field is not a ${fType}: ${name}`);

        const de = this.addDataElement(data, alignment);
        this.#setPtr(element, de.offset, de.size);
        return this;
    }

    #setPtr(element: DataElement, dataOffset: number, dataLength: number): void {
        assert(element.data.byteLength >= 8, `Pointer data too small: ${element.name}`);
        const view = new DataView(element.data.buffer, element.data.byteOffset, element.data.byteLength);
        view.setUint32(0, dataOffset, this.#useLE);
        view.setUint32(4, dataLength, this.#useLE);
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

    /**
     * Get a string from the data.
     * It will decode the string as UTF-8 from the following field types: 'string', 'ptrString', 'ptrUint8Array'.
     * @param name - name of the string field
     * @returns string value
     */
    getString(name: string): string {
        const element = this.getDataElement(name);
        const formatElement = element.ref;
        if (formatElement.type === 'string') {
            return this.#decoder.decode(element.data);
        }
        assert(knownStringTypes.has(formatElement.type), `Field is not a string: ${name}`);
        const strData = this.#getPtrData(element);
        return this.#decoder.decode(strData);
    }

    /**
     * Get a uint32 from the data.
     * @param name - name of the uint32 field
     * @returns number value
     */
    getUint32(name: string): number {
        const element = this.getDataElement(name);
        const formatElement = element.ref;
        assert(formatElement.type === 'uint32', `Field is not a uint32: ${name}`);
        const view = new DataView(element.data.buffer, element.data.byteOffset, element.data.byteLength);
        return view.getUint32(0, this.#useLE);
    }

    /**
     * Gets Uint32Array data from a pointer field.
     * Note: The returned Uint32Array may be a view of the underlying data.
     * If the endianness does not match, a copy will be made.
     * @param name - name of the field
     * @returns Uint32Array value
     */
    getPtrUint32Array(name: string): Uint32Array {
        const element = this.getDataElement(name);
        assert(element.ref.type === 'ptrUint32Array', `Field is not a ptrUint32Array: ${name}`);
        const arrData = this.#getPtrData(element);
        const rawData32 = new Uint32Array(arrData.buffer, arrData.byteOffset, arrData.byteLength / 4);
        if (isLittleEndian === this.#useLE) {
            return rawData32;
        }
        const data = new Uint32Array(rawData32);
        return convertUint32ArrayEndiannessInPlace(data);
    }

    /**
     * Gets Uint8Array data from a pointer field.
     * Note: The returned Uint8Array is a view of the underlying data.
     * @param name - name of the field
     * @returns Uint8Array value
     */
    getPtrUint8Array(name: string): Uint8Array {
        const element = this.getDataElement(name);
        assert(element.ref.type === 'ptrUint8Array', `Field is not a ptrUint8Array: ${name}`);
        return this.#getPtrData(element);
    }

    /**
     * Gets string data from a pointer field.
     * @param name - name of the field
     * @returns string value
     */
    getPtrString(name: string): string {
        const element = this.getDataElement(name);
        assert(element.ref.type === 'ptrString', `Field is not a ptrString: ${name}`);
        const strData = this.#getPtrData(element);
        return this.#decoder.decode(strData);
    }

    #getPtrData(element: DataElementWithRef): Uint8Array {
        const formatElement = element.ref;
        assert(formatElement.type.startsWith('ptr'), `Field is not a ptr: ${element.name} (${formatElement.type})`);
        const view = new DataView(element.data.buffer, element.data.byteOffset, element.data.byteLength);
        const offset = view.getUint32(0, this.#useLE);
        const length = view.getUint32(4, this.#useLE);
        return this.data.subarray(offset, offset + length);
    }

    /**
     * Get the Element information by name
     * @param name - name of the field
     * @returns DataElementWithRef
     */
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

function formatElementToJSON(fe: FormatElement): unknown {
    const { value } = fe;
    const v = value ? [...value] : undefined;
    return { ...fe, value: v };
}

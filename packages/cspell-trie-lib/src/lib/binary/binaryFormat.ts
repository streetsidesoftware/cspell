import { assert } from '../utils/assert.ts';
import { endianness } from '../utils/endian.ts';

const isLittleEndian: boolean = endianness() === 'LE';

export type FormatType =
    | 'value' // A raw value
    // | 'ptr' // A 32bit pointer without length
    | 'ptr+size'; // A 32bit pointer followed by a 32bit size

type U8Array = Uint8Array<ArrayBuffer>;
type U32Array = Uint32Array<ArrayBuffer>;
type U16Array = Uint16Array<ArrayBuffer>;

const BytesSize = {
    uint8: 1, // Uint8Array.BYTES_PER_ELEMENT
    uint16: 2, // Uint16Array.BYTES_PER_ELEMENT
    uint32: 4, // Uint32Array.BYTES_PER_ELEMENT
    uint64: 8, // Uint64Array.BYTES_PER_ELEMENT
    string: 1,
} as const;

export type ByteSize = 1 | 2 | 4 | 8;

export interface FormatElement {
    /** name of the element */
    name: string;
    /** the description of the element */
    description: string;
    /** the type of element */
    type: FormatType;
    /**
     * This field indicates the size of each element in bytes.
     * - 1 = 1 byte (8 bits) - for bytes or UTF-8 strings
     * - 2 = 2 bytes (16 bits)
     * - 4 = 4 bytes (32 bits)
     * - 8 = 8 bytes (64 bits)
     *
     * Used for pointers to indicate the size of each element pointed to.
     */
    byteSize: ByteSize;

    /** the byte alignment of this element, not what it might be pointed to */
    alignment: ByteAlignment;

    /** offset in bytes */
    offset: number;
    /** size in bytes */
    size: number;

    /** An expected value */
    value?: Uint8Array<ArrayBuffer> | undefined;

    /**
     * This is to allow two different elements to share the same data.
     */
    overload?: string | undefined;
}

interface DataArrayView extends ArrayBufferView<ArrayBuffer> {
    length: number;
}

/**
 * BinaryFormatBuilder is used to define the structure and layout of binary data.
 * It provides methods to add various data types (uint8, uint16, uint32, strings, arrays)
 * and pointers to the format definition. Each element is automatically aligned and positioned
 * based on its type and size. Once all elements are added, call build() to create an
 * immutable BinaryFormat that can be used with BinaryDataBuilder and BinaryDataReader.
 */
export class BinaryFormatBuilder {
    #elements: FormatElement[] = [];
    #elementsByName: Map<string, FormatElement> = new Map();
    #offset = 0;
    #textEncoder = new TextEncoder();

    addUint8(name: string, description: string, value?: number | Uint8Array | number[]): BinaryFormatBuilder {
        const uValue =
            value === undefined || typeof value === 'number' ? new Uint8Array([value || 0]) : new Uint8Array(value);
        return this.addData(name, description, 'value', uValue);
    }

    addUint16(name: string, description: string, value?: number): BinaryFormatBuilder {
        const uValue = value !== undefined ? rawNumberToUint16Array(value) : rawNumberToUint16Array(0);
        return this.addData(name, description, 'value', uValue);
    }

    addUint32(name: string, description: string, value?: number): BinaryFormatBuilder {
        const uValue = value !== undefined ? rawNumberToUint32Array(value) : rawNumberToUint32Array(0);
        return this.addData(name, description, 'value', uValue);
    }

    /**
     * A pointer to a uint32 array, it has two parts, the offset and the length.
     * @param name - name of pointer
     * @param description - the description of the field
     * @param overload - optional name of element to overload
     * @returns this
     */
    addUint32ArrayPtr(name: string, description: string, overload?: string): BinaryFormatBuilder {
        return this.addPointer(BytesSize.uint32, name, description, overload);
    }

    /**
     * A pointer to a uint16 array, it has two parts, the offset and the length.
     * @param name - name of pointer
     * @param description - the description of the field
     * @param overload - optional name of element to overload
     * @returns this
     */
    addUint16ArrayPtr(name: string, description: string, overload?: string): BinaryFormatBuilder {
        return this.addPointer(BytesSize.uint16, name, description, overload);
    }

    /**
     * A pointer to a uint8 array, it has two parts, the offset and the length.
     * @param name - name of pointer
     * @param description - the description of the field
     * @param overload - optional name of element to overload
     * @returns this
     */
    addUint8ArrayPtr(name: string, description: string, overload?: string): BinaryFormatBuilder {
        return this.addPointer(BytesSize.uint8, name, description, overload);
    }

    /**
     * A pointer to a string of UTF-8 bytes, it has two parts, the offset and the length.
     * @param name - name of pointer
     * @param description - the description of the field
     * @param overload - optional name of element to overload
     * @returns this
     */
    addStringPtr(name: string, description: string, overload?: string): BinaryFormatBuilder {
        return this.addPointer(BytesSize.string, name, description, overload);
    }

    /**
     * Add a pointer element.
     * @param byteSize - size of each element pointed to
     * @param name - name of the pointer
     * @param description - description of the pointer
     * @param overload - optional name of element to overload
     * @returns this
     */
    addPointer(byteSize: ByteSize, name: string, description: string, overload?: string): BinaryFormatBuilder {
        const alignment: ByteAlignment = 4;
        let offset = byteAlign(this.#offset, alignment);
        if (overload) {
            const existing = this.#elementsByName.get(overload);
            assert(existing, `Overload target not found: ${overload}`);
            offset = byteAlign(existing.offset, alignment);
            assert(existing.offset === offset, `Overload target offset mismatch: ${overload}`);
        }
        const element: FormatElement = {
            name,
            description,
            type: 'ptr+size',
            alignment,
            offset,
            size: 8,
            value: undefined,
            byteSize,
            overload,
        };
        this.#addElement(element);
        return this;
    }

    addString(name: string, description: string, length: number | string): BinaryFormatBuilder {
        const value = typeof length === 'string' ? this.#textEncoder.encode(length) : new Uint8Array(length);
        this.addData(name, description, 'value', value);
        return this;
    }

    addUint8Array(name: string, description: string, length: number | Uint8Array | number[]): BinaryFormatBuilder {
        // `as number` is needed because the type definition for `new Uint8Array` is wrong.
        const value = new Uint8Array(length as number);
        this.addData(name, description, 'value', value);
        return this;
    }

    addData(name: string, description: string, formatType: FormatType, data: DataArrayView): BinaryFormatBuilder {
        const byteSize = data.byteLength / data.length;
        assert(isByteAlignment(byteSize), `Invalid byte size: ${byteSize} for field: ${name}`);
        const alignment = byteSize;
        const offset = byteAlign(this.#offset, byteSize);
        const value = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        const size = value.byteLength;
        this.#addElement({ name, description, type: formatType, alignment, offset, size, value, byteSize });
        return this;
    }

    #addElement(element: FormatElement): void {
        assert(!this.#elementsByName.has(element.name), `Duplicate element name: ${element.name}`);
        const expectedOffset = byteAlign(element.offset, element.alignment);
        assert(
            element.offset === expectedOffset,
            `Element alignment mismatch for ${element.name} with alignment ${element.alignment}. Expected: ${expectedOffset}, Found: ${element.offset}`,
        );
        this.#elementsByName.set(element.name, element);
        this.#elements.push(element);
        if (!element.overload) {
            this.#offset = element.offset + element.size;
        }
    }

    build(): BinaryFormat {
        return new BinaryFormat([...this.#elements]);
    }
}

/**
 * BinaryFormat represents the structure and layout of binary data.
 * It contains a collection of format elements that describe the fields,
 * their types, offsets, sizes, and byte alignment within the binary data.
 *
 * This class is typically created using BinaryFormatBuilder and is used
 * by BinaryDataBuilder and BinaryDataReader to write and read binary data
 * according to the defined format.
 */
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
        this.elements.forEach(addElement);

        return lines.join('\n');

        function addHeaderLines(): void {
            const line = formatLine(['name', 'offset', 'size', 'type', 'mask', 'description', 'value']);
            lines.push('Binary Format:');
            lines.push(line);
            lines.push('-'.repeat(line.length));
        }

        function addElement(e: FormatElement): void {
            lines.push(
                formatLine([
                    e.name,
                    e.offset.toString(),
                    e.size.toString(),
                    e.type,
                    e.byteSize.toString(2).padStart(4, '0'),
                    e.description,
                    e.value ? `${e.value}` : '',
                ]),
            );
        }

        type LineData = [
            name: string,
            offset: string,
            size: string,
            type: string,
            mask: string,
            description: string,
            value: string,
        ];

        function formatLine([name, offset, size, type, mask, description, value]: LineData): string {
            name = name.padEnd(nameWidth, ' ');
            offset = offset.padStart(offsetWidth, ' ');
            size = size.padStart(sizeWidth, ' ');
            type = type.padEnd(typeWidth, ' ');
            value = value ? `(${value})` : '';
            return `${name} ${offset} ${size} ${type} ${mask} ${description} ${value}`.trim();
        }
    }
}

export interface DataElement {
    name: string;
    offset: number;
    size: number;
    data: U8Array;
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
    #dataByOffset: Map<number, U8Array> = new Map();
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
            let data = this.#dataByOffset.get(offset);
            if (!data || data.byteLength < size) {
                data = new Uint8Array(size);
                this.#dataByOffset.set(offset, data);
            }
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
        assert(formatElement.byteSize === BytesSize.string, `Field is not a string: ${name}`);

        const r = this.#encoder.encodeInto(value, element.data);
        assert(r.read === value.length, `String too long for field ${name}: ${value}`);
        return this;
    }

    setUint32(name: string, value: number): BinaryDataBuilder {
        const element = this.getDataElement(name);
        assert(element, `Field not found: ${name}`);
        const formatElement = element.ref;
        assert(formatElement, `Field Format not found: ${name}`);
        assert(formatElement.byteSize === BytesSize.uint32, `Field is not a uint32: ${name}`);

        const view = new DataView(element.data.buffer, element.data.byteOffset, element.data.byteLength);
        const useLittle = this.#endian === 'LE';
        view.setUint32(0, value, useLittle);

        return this;
    }

    setUint16(name: string, value: number): BinaryDataBuilder {
        const element = this.getDataElement(name);
        assert(element, `Field not found: ${name}`);
        const formatElement = element.ref;
        assert(formatElement, `Field Format not found: ${name}`);
        assert(formatElement.byteSize === BytesSize.uint16, `Field is not a uint16: ${name}`);

        const view = new DataView(element.data.buffer, element.data.byteOffset, element.data.byteLength);
        const useLittle = this.#endian === 'LE';
        view.setUint16(0, value, useLittle);

        return this;
    }

    setUint8(name: string, value: number): BinaryDataBuilder {
        const element = this.getDataElement(name);
        assert(element, `Field not found: ${name}`);
        const formatElement = element.ref;
        assert(formatElement, `Field Format not found: ${name}`);
        assert(formatElement.byteSize === BytesSize.uint8, `Field is not a uint8: ${name}`);
        element.data[0] = value;

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
    addDataElement(data: Uint8Array<ArrayBuffer>, alignment: ByteAlignment): DataElement {
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
    setPtrUint32Array(name: string, data: U32Array, alignment: ByteAlignment = 4): BinaryDataBuilder {
        return this.#setPtrData(name, convertUint32ArrayToUint8Array(data, this.#useLE), alignment);
    }

    /**
     * Append the data and set the pointer to it.
     * The Uint16Array  will be converted to the proper endianness if necessary.
     * @param name - name of the pointer field
     * @param data - the data to add
     * @param alignment - the alignment for the data, default 2
     * @returns this
     */
    setPtrUint16Array(name: string, data: U16Array, alignment: ByteAlignment = 2): BinaryDataBuilder {
        return this.#setPtrData(name, convertUint16ArrayToUint8Array(data, this.#useLE), alignment);
    }

    /**
     * Append the data and set the pointer to it.
     * @param name - name of the pointer field
     * @param data - the data to add
     * @param alignment - the alignment for the data, default 1
     * @returns this
     */
    setPtrUint8Array(name: string, data: U8Array, alignment: ByteAlignment = 1): BinaryDataBuilder {
        return this.#setPtrData(name, data, alignment);
    }

    /**
     * Append the string and set the pointer to it. It will be encoded as UTF-8.
     * Note: the alignment is 1. Use alignTo() if you need a different alignment.
     * @param name - name of the pointer field
     * @param str - the data to add
     * @returns this
     */
    setPtrString(name: string, str: string): BinaryDataBuilder {
        return this.#setPtrData(name, this.#encoder.encode(str), 1);
    }

    #setPtrData(name: string, dataView: DataArrayView, alignment: ByteAlignment): this {
        const element = this.getDataElement(name);
        assert(element, `Field not found: ${name}`);
        const formatElement = element.ref;
        assert(formatElement, `Field Format not found: ${name}`);
        assert(formatElement.type === 'ptr+size', `Field is not a pointer: ${name}`);
        assert(formatElement.byteSize === alignment, `Pointer byte size mismatch: ${name}`);
        const data = new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength);
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

    build(): U8Array {
        const buffer = new Uint8Array(this.#offset);
        for (const element of this.#dataElementMap.values()) {
            buffer.set(element.data, element.offset);
        }
        return buffer;
    }
}

export function convertUint32ArrayEndiannessInPlace<T extends ArrayBufferView<ArrayBuffer>>(data: T): T;
export function convertUint32ArrayEndiannessInPlace<T extends ArrayBufferView>(data: T): T;
export function convertUint32ArrayEndiannessInPlace(data: Uint32Array): Uint32Array;
export function convertUint32ArrayEndiannessInPlace(data: Uint32Array): Uint32Array {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const byteLength = data.length * 4;
    for (let i = 0; i < byteLength; i += 4) {
        const v = view.getUint32(i, true);
        view.setUint32(i, v, false);
    }
    return data;
}

export function convertUint16ArrayEndiannessInPlace<T extends ArrayBufferView<ArrayBuffer>>(data: T): T;
export function convertUint16ArrayEndiannessInPlace<T extends ArrayBufferView>(data: T): T;
export function convertUint16ArrayEndiannessInPlace(data: Uint16Array): Uint16Array;
export function convertUint16ArrayEndiannessInPlace(data: Uint16Array): Uint16Array {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const byteLength = data.length * 2;
    for (let i = 0; i < byteLength; i += 2) {
        const v = view.getUint16(i, true);
        view.setUint16(i, v, false);
    }
    return data;
}

export function convertUint32ArrayToUint8Array(
    data: U32Array,
    useLittle: boolean,
    isLE: boolean = isLittleEndian,
): U8Array {
    if (isLE === useLittle) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }

    const target = new Uint32Array(data.length);
    target.set(data);
    convertUint32ArrayEndiannessInPlace(target);
    return new Uint8Array(target.buffer, target.byteOffset, target.byteLength);
}

export function convertUint16ArrayToUint8Array(
    data: U16Array,
    useLittle: boolean,
    isLE: boolean = isLittleEndian,
): U8Array {
    if (isLE === useLittle) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }

    const target = new Uint16Array(data.length);
    target.set(data);
    convertUint16ArrayEndiannessInPlace(target);
    return new Uint8Array(target.buffer, target.byteOffset, target.byteLength);
}

function rawNumberToUint32Array(value: number): Uint32Array<ArrayBuffer> {
    return new Uint32Array([value]);
}

function rawNumberToUint16Array(value: number): U16Array {
    return new Uint16Array([value]);
}

export class BinaryDataReader {
    readonly data: U8Array;
    readonly format: BinaryFormat;
    #decoder = new TextDecoder();
    #useLE: boolean;

    /**
     * Binary Data Reader
     * @param data - the raw binary data
     * @param format - the expected format
     * @param endian - the endian of the data (can be changed later)
     */
    constructor(data: ArrayBufferView<ArrayBuffer>, format: BinaryFormat, endian: 'LE' | 'BE' = endianness()) {
        this.data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
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
        assert(formatElement.byteSize === BytesSize.string, `Field is not a string: ${name}`);
        if (formatElement.type === 'value') {
            return this.#decoder.decode(element.data);
        }
        assert(formatElement.type === 'ptr+size', `Field is not a string: ${name}`);
        const strData = this.#getPtrData(element);
        return this.#decoder.decode(strData);
    }

    /**
     * Get a Uint32 from the data.
     * @param name - name of the Uint32 field
     * @returns number value
     */
    getUint32(name: string): number {
        const element = this.getDataElement(name);
        const formatElement = element.ref;
        assert(
            formatElement.type === 'value' && formatElement.byteSize === BytesSize.uint32,
            `Field is not a uint32: ${name}`,
        );
        const view = new DataView(element.data.buffer, element.data.byteOffset, element.data.byteLength);
        return view.getUint32(0, this.#useLE);
    }

    /**
     * Get a Uint16 from the data.
     * @param name - name of the Uint16 field
     * @returns number value
     */
    getUint16(name: string): number {
        const element = this.getDataElement(name);
        const formatElement = element.ref;
        assert(
            formatElement.type === 'value' && formatElement.byteSize === BytesSize.uint16,
            `Field is not a uint16: ${name}`,
        );
        const view = new DataView(element.data.buffer, element.data.byteOffset, element.data.byteLength);
        return view.getUint16(0, this.#useLE);
    }

    /**
     * Read a field as Uint16 starting at the given byte offset.
     * @param name - name of field
     * @param byteOffset - offset of in bytes from the beginning of the field
     * @returns the value read.
     */
    getAsUint16(name: string, byteOffset: number = 0): number {
        const element = this.getDataElement(name);
        const view = new DataView(element.data.buffer, element.data.byteOffset, element.data.byteLength);
        return view.getUint16(byteOffset, this.#useLE);
    }

    /**
     * Get a Uint8 from the data.
     * @param name - name of the Uint8 field
     * @returns number value
     */
    getUint8(name: string): number {
        const element = this.getDataElement(name);
        const formatElement = element.ref;
        assert(
            formatElement.type === 'value' && formatElement.byteSize === BytesSize.uint8,
            `Field is not a uint8: ${name}`,
        );
        return element.data[0];
    }

    /**
     * Gets Uint32Array data from a pointer field.
     * Note: The returned Uint32Array may be a view of the underlying data.
     * If the endianness does not match, a copy will be made.
     * @param name - name of the field
     * @returns Uint32Array value
     */
    getPtrUint32Array(name: string): U32Array {
        const element = this.getDataElement(name);
        const ref = element.ref;
        assert(ref.type === 'ptr+size' && ref.byteSize === BytesSize.uint32, `Field is not a ptrUint32Array: ${name}`);
        const arrData = this.#getPtrData(element);
        const rawData32 = new Uint32Array<ArrayBuffer>(
            arrData.buffer,
            arrData.byteOffset,
            arrData.byteLength / ref.byteSize,
        );
        if (isLittleEndian === this.#useLE) {
            return rawData32;
        }
        const data = new Uint32Array(rawData32);
        return convertUint32ArrayEndiannessInPlace(data);
    }

    /**
     * Gets Uint16Array data from a pointer field.
     * Note: The returned Uint16Array may be a view of the underlying data.
     * If the endianness does not match, a copy will be made.
     * @param name - name of the field
     * @returns Uint16Array value
     */
    getPtrUint16Array(name: string): U16Array {
        const element = this.getDataElement(name);
        const ref = element.ref;
        assert(ref.type === 'ptr+size' && ref.byteSize === BytesSize.uint16, `Field is not a ptrUint16Array: ${name}`);
        const arrData = this.#getPtrData(element);
        const rawData16 = new Uint16Array<ArrayBuffer>(
            arrData.buffer,
            arrData.byteOffset,
            arrData.byteLength / ref.byteSize,
        );
        if (isLittleEndian === this.#useLE) {
            return rawData16;
        }
        const data = new Uint16Array(rawData16);
        return convertUint16ArrayEndiannessInPlace(data);
    }

    /**
     * Gets Uint8Array data from a pointer field.
     * Note: The returned Uint8Array is a view of the underlying data.
     * @param name - name of the field
     * @returns Uint8Array value
     */
    getPtrUint8Array(name: string): U8Array {
        const element = this.getDataElement(name);
        assert(element.ref.type === 'ptr+size', `Field is not a ptr+size: ${name}`);
        return this.#getPtrData(element);
    }

    /**
     * Gets string data from a pointer field.
     * @param name - name of the field
     * @returns string value
     */
    getPtrString(name: string): string {
        const element = this.getDataElement(name);
        assert(element.ref.type === 'ptr+size', `Field is not a ptr+size: ${name}`);
        const strData = this.#getPtrData(element);
        return this.#decoder.decode(strData);
    }

    #getPtrData(element: DataElementWithRef): U8Array {
        const formatElement = element.ref;
        assert(formatElement.type === 'ptr+size', `Field is not a ptr+size: ${element.name} (${formatElement.type})`);
        const view = new DataView<ArrayBuffer>(element.data.buffer, element.data.byteOffset, element.data.byteLength);
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

    get endian(): 'LE' | 'BE' {
        return this.#useLE ? 'LE' : 'BE';
    }

    reverseEndian(): void {
        this.#useLE = !this.#useLE;
    }

    /**
     * Get the raw bytes for a field.
     * @param name - name of the field
     * @returns the bytes or undefined
     */
    getUint8Array(name: string): U8Array | undefined {
        const element = this.getDataElement(name);
        if (!element) return undefined;
        return element.data;
    }

    /**
     * Get the FormatElement for a field.
     * @param name - name of the field
     * @returns the element or undefined
     */
    getField(name: string): FormatElement | undefined {
        return this.format.getField(name);
    }
}

function formatElementToJSON(fe: FormatElement): unknown {
    const { value } = fe;
    const v = value ? [...value] : undefined;
    return { ...fe, value: v };
}

function byteAlign(offset: number, alignment: ByteAlignment): number {
    const aMask = alignment - 1;
    return (offset + aMask) & ~aMask; // align to alignment bytes
}

function isByteAlignment(value: number): value is ByteAlignment {
    return value === 1 || value === 2 || value === 4 || value === 8;
}

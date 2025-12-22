let cachedEndianness: 'LE' | 'BE' | undefined;

export function endianness(): 'LE' | 'BE' {
    if (cachedEndianness) return cachedEndianness;
    const testValue = 0x0a0b_0c0d;
    const uint32s = new Uint32Array([testValue]);
    const bytes = new Uint8Array(uint32s.buffer);
    return bytes[0] === 0x0a ? 'BE' : 'LE';
}

const regexUnitNumber = /^((?:\d+(?:\.\d*)?)|(?:\.\d+))([a-z]*)$/i;

const unitSizes: Record<string, number | undefined> = {
    '': 1,
    b: 1,
    k: 1024,
    kb: 1024,
    m: 1 << 20,
    mb: 1 << 20,
    g: 1 << 30,
    gb: 1 << 30,
};

interface ParsedResult {
    digits: string;
    units: string;
    error?: string;
    size: string;
}

function parseUnitSize(size: string): ParsedResult {
    const match = size.match(regexUnitNumber);
    const digits = match?.[1] || '';
    const units = (match?.[2] || '').toLowerCase();
    if (!match) return { size, digits, units, error: 'Invalid size.' };

    if (!units || units in unitSizes) return { size, digits, units };

    const error = `Unknown units. Valid units are: ${Object.keys(unitSizes).filter(Boolean).join(', ').toUpperCase()}.`;
    return { size, digits, units, error };
}

export function validateUnitSize(size: string): string | undefined {
    return parseUnitSize(size).error;
}

export function sizeToNumber(size: string): number {
    const p = parseUnitSize(size);
    if (p.error) return Number.NaN;
    return Number.parseFloat(p.digits) * (unitSizes[p.units] || 1);
}

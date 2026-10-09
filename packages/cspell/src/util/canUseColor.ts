export function canUseColor(colorOption: boolean | undefined): boolean | undefined {
    if (colorOption !== undefined) return colorOption;
    if (!('NO_COLOR' in process.env)) return undefined;
    return !process.env['NO_COLOR'] || process.env['NO_COLOR'] === 'false' ? undefined : false;
}

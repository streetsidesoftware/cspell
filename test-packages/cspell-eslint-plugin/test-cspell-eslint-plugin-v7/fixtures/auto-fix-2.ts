const about_the = ['one', 'two', 'three'];

/**
 * This is about the file with errors that can be autoFixed.
 * What do you think about it?
 * Time to go to the cafe.
 */
export function calcGreenList(names: string[]) {
    const greenListSet = new Set(about_the);

    return names.filter((name) => greenListSet.has(name));
}

export const as_well = 5;

const aboutthe = ['one', 'two', 'three'];

/**
 * This is aboutthe file with errors that can be autoFixed.
 * What do you think aboutit?
 * Time to go to the café.
 */
export function calcBluelist(names) {
    const bluelistSet = new Set(aboutthe);

    return names.filter((name) => bluelistSet.has(name));
}

export const aswell = 5;

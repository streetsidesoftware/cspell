const bluelist = ['one', 'two', 'three'];

/**
 * This is a file with errors that can be autoFixed.
 *
 * Time to go to the café.
 */
export function calcBluelist(names: string[]) {
    const bluelistSet = new Set(bluelist);

    return names.filter(name => bluelistSet.has(name));
}

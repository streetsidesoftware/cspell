const greenList = ['one', 'two', 'three'];

/**
 * This is a file with errors that can be autoFixed.
 *
 * Time to go to the cafe.
 */
export function calcGreenList(names: string[]) {
    const greenListSet = new Set(greenList);

    return names.filter((name) => greenListSet.has(name));
}

import { PairingHeap } from './PairingHeap';

describe('PairingHeap', () => {
    test('Basic add and remove', () => {
        const compare = new Intl.Collator().compare;
        const values = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
        const sorted = values.concat().sort(compare);
        const heap = new PairingHeap(compare);
        values.forEach((v) => heap.add(v));
        expect(heap.length).toBe(values.length);
        const result = [...heap];
        expect(result).toEqual(sorted);
        expect(heap.length).toBe(0);
    });

    interface Person {
        name: string;
    }

    test('FIFO for latest', () => {
        const compareStr = new Intl.Collator().compare;
        const compare = (a: Person, b: Person) => compareStr(a.name, b.name);
        const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July'];
        const people: Person[] = names.map((name) => ({ name }));
        const sorted = people.concat().sort(compare);
        const heap = new PairingHeap(compare);

        heap.add(people[0]);
        expect(heap.dequeue()).toBe(people[0]);
        expect(heap.length).toBe(0);
        expect(heap.peek()).toBeUndefined();
        expect(heap.dequeue()).toBeUndefined();

        heap.concat(people);
        expect(heap.dequeue()).toBe(sorted[0]);
        expect(heap.dequeue()).toBe(sorted[1]);
        heap.concat(people);
        expect(heap.dequeue()).toBe(sorted[0]);
        expect(heap.dequeue()).toBe(sorted[1]);
        expect(heap.peek()).toBe(sorted[2]);
        expect(heap.dequeue()).toBe(sorted[2]);
        expect(heap.dequeue()).toBe(sorted[2]);
        expect(heap.peek()).toBe(sorted[3]);

        heap.add(sorted[0]);
        expect(heap.peek()).toBe(sorted[0]);
        const copy = { ...sorted[0] };
        // Make sure we get back the open we added.
        expect(heap.add(copy).peek()).toBe(copy);
    });
});

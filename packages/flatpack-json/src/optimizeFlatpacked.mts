import { Flatpacked } from './types.mts';

export function optimizeFlatpacked(data: Flatpacked): Flatpacked {
    const [header, ...elements] = data;
    if (header !== 'Dehydrated JSON v1') {
        throw new Error('Invalid header');
    }
    const optimizedElements = elements.map((element) => {
        if (Array.isArray(element)) {
            return element.map((subElement) => optimizeElement(subElement));
        }
        return optimizeElement(element);
    });
    return [header, ...optimizedElements];
}

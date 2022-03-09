/**
 * This is a sample with spelling errors in template strings.
 */

const now = new Date();

export const messageToday = `
Todayy is ${now.toLocaleDateString(undefined, { weekday: 'long' })}.
Day ${now.toLocaleDateString(undefined, { day: 'numeric' })} of the Montj of ${now.toLocaleDateString(undefined, { month: 'long' })}
in the Yaar ${now.toLocaleDateString(undefined, { year: 'numeric' })}.
`

export const months = 'January\u00eb, Februarry, March, Aprill, May, June';

export const templateWithUnicodeEscapeSequences = `
Lets gooo to a caf\u00e9 or a cafe\u0301? ${now.getDay() === 0 ? 'Yes' : 'No'}
Only if Today is ${now.toLocaleDateString(undefined, { weekday: 'long' })} it is the start of the weeek.
`;

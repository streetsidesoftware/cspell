// ts-check
import { HunspellReader } from 'hunspell-reader';

const baseFile = 'en_US';
const dicFile = baseFile + '.dic';
const affFile = baseFile + '.aff';

// Initialize the reader with the Hunspell files
const reader = await HunspellReader.createFromFiles(affFile, dicFile);

// Get the words as an array
const words = [...reader];
console.log('%o', words);

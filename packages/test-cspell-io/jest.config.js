const parent = require('../../jest.config');

// Make sure both the ts and js files are tested.
const config = { ...parent, roots: ['./src', './dist'] };

module.exports = config;

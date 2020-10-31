const inherit = require('../../jest.config')
const local = {...inherit, roots: inherit.roots.concat(['./dist'])};
module.exports = local;

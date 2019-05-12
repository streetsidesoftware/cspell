"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const DefaultSettings = require("./DefaultSettings");
describe('Validate Default Settings', () => {
    it('test the static default settings', () => {
        const df = DefaultSettings._defaultSettings;
        chai_1.expect(df.name).to.be.equal('Static Defaults');
    });
    it('tests the default setting file is loaded', () => {
        const defaultSetting = DefaultSettings.getDefaultSettings();
        chai_1.expect(defaultSetting.name).to.be.equal('cspell default json');
    });
});
//# sourceMappingURL=DefaultSettings.test.js.map
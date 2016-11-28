var util = require('util'),

    _ = require('lodash'),

    AvocodeVariable = require('./variable');

/**
 * @extends AvocodeVariable
 * @class AvocodeFont
 */
class AvocodeFont extends AvocodeVariable {
    constructor(avcdValue) {
        var varValue = util.format("font-family:\\s*\"?%s\"?;", avcdValue.name),
            varName = `font-family-${_.kebabCase(avcdValue.name)}`;
        super(varName, varValue, 'replace');
    }

}

module.exports = AvocodeFont;

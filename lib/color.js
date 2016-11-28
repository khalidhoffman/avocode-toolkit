var util = require('util'),

    _ = require('lodash'),
    color = require('onecolor'),
    colorNamer = require('color-namer'),

    AvocodeVariable = require('./variable');

/**
 * @extends AvocodeVariable
 * @class AvocodeColor
 */
class AvocodeColor extends AvocodeVariable {
    constructor(avcdValue, options) {
        if (avcdValue) {
            var newColor = color(util.format('rgba(%s, %s, %s)', avcdValue['r'], avcdValue['g'], avcdValue['b']));
        }
        var colorMeta = _.defaults(options, {
            name: newColor ? `$color-${_.kebabCase(colorNamer(newColor.hex()).ntc[0].name)}` : null,
            hex: newColor ? newColor.hex() : null
        });

        super(colorMeta.name, colorMeta.hex, 'color');
    }

}

module.exports = AvocodeColor;

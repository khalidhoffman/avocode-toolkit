var util = require('util'),

    AvocodeColor = require('./color'),
    AvocodeFont = require('./font'),
    utils = require('../utils');

class AvocodeDocument {
    constructor(docData) {
        this.fonts = [];
        this.colors = [];
        this._docData = docData;
        this._parse();
    }

    _parse() {
        utils.recurseObject(this._docData, {
            each: (value, key) => {
                switch (key) {
                    case 'color':
                        this.colors.push(new AvocodeColor(value));
                        break;
                    case 'font':
                        if (value.name){
                            this.fonts.push(new AvocodeFont(value));
                        } else{
                            // ignore invalid font
                        }
                        break;
                    default:
                        break;
                }
            }
        });
    }

    getColors() {
        return this.colors;
    }

    getFonts() {
        return this.fonts;
    }
}

module.exports = AvocodeDocument;
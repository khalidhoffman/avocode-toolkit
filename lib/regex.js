var AvocodeVariable = require('./variable');

class AvocodeRegex extends AvocodeVariable {
    constructor() {
        super(...arguments);
        this.type = "replace";
    }
}

module.exports = AvocodeRegex;

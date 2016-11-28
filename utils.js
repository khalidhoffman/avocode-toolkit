module.exports = {
    /**
     *
     * @param {Object} obj
     * @param {Object} [options]
     * @param {Function} [options.each]
     */
    recurseObject: function (obj, options) {
        var _options = options || {};

        function recurse(obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] == "object" && obj[key] !== null) {
                        if (_options.each) _options.each.apply(null, [obj[key], key]);
                        recurse(obj[key]);
                    } else {

                    }
                }
            }

        }
        recurse.call(this, obj);
    }
};

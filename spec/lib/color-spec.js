var AvocodeColor = require('../../lib/color');

describe('AvocodeColor', function () {
    var testAvcdColor = new AvocodeColor({r: 0, b: 0, g: 0, a: 1});

    describe("toStateObject()", function () {

        it("returns an object resembling an avocode state variable", function () {
            var colorObject = testAvcdColor.toStateObject();
            expect(colorObject).not.toBeUndefined();
            expect(colorObject.__record).toEqual('Variable');
            expect(colorObject.data.type).toEqual('color');
            expect(colorObject.data.name).not.toBeUndefined();
            expect(colorObject.data.value).not.toBeUndefined();
        });

        it("can be overriden with options", function () {
            var overrides = {
                    name: "$color-white",
                    hex: "#000000"
                },
                t2AvcdColor = new AvocodeColor(null, overrides),
                colorObject = t2AvcdColor.toStateObject();

            expect(colorObject).not.toBeUndefined();
            expect(colorObject.__record).toEqual('Variable');
            expect(colorObject.data.type).toEqual('color');
            expect(colorObject.data.name).toEqual(overrides.name);
            expect(colorObject.data.value).toEqual(overrides.hex);
        })
    })

});
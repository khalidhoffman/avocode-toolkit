/**
 * @class AvocodeVariable
 * @param {String} name
 * @param {String} value
 */
class AvocodeVariable {
    constructor(name, value, type){
        this.name = name;
        this.value = value;
        this.type = type;
    }

    toStateObject() {
        return {
            __record: "Variable",
            data : {
                type: this.type,
                name: this.name,
                value: this.value
            }
        }
    }

    getValue(){
        return this.value;
    }

    getName (){
        return this.name;
    }

    setName (name){
        this.name = name;
    }

    setValue (value){
        this.value = value;
    }

    toString(){
        return JSON.stringify(this.toStateObject());
    }
}

module.exports = AvocodeVariable;

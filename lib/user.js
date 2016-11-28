var _ = require('lodash');

class AvocodeUser{
    constructor(name, state){
        this.name = name;
        this.state = state;
        this._nameRegex = new RegExp(this.name, 'ig');

        var userData = _.find(this.state.data, (stateDataEntry) => {
            return (stateDataEntry[0]  == 'user' && stateDataEntry[1].data.name.match(this._nameRegex))
        });
        this.id = userData[1].data.id;
    }

    getId(){
        return this.id;
    }
}

module.exports = AvocodeUser;
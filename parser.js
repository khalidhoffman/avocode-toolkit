var _ = require('lodash'),

    AvocodeProject = require('./lib/project');

class Avocode {
    constructor(state) {
        this.state = state;
        this.projects = {};
    }

    getProject(projectName) {
        var projectSlug = _.kebabCase(projectName);
        this.projects[projectSlug] = this.projects[projectSlug] || new AvocodeProject(projectName, this.state);
        return this.projects[projectSlug];
    }
}

module.exports = Avocode;

var _ = require('lodash');

class AvocodeProject {
    constructor(projectName, state) {
        this.meta = {
            name: projectName,
            projectId: -1
        };
        this.state = state;
        this._parseUserData();
        this._parseSettings();
    }

    _parseUserData() {
        var projectNameRegex = new RegExp(this.meta.name, 'ig'),
            avcdUserData = _.find(this.state.data, (settingsEntry) => {
                return settingsEntry[0] == "user_data";
            }),
            projects = avcdUserData[1].data.projects.data,
            projectData = _.find(projects, (projectEntry) => {
                return projectNameRegex.test(projectEntry.data.name)
            });
        this.data = projectData.data;
        this.meta.projectId = this.data.id;
    }

    _parseSettings() {
        var avcdSettings = _.find(this.state.data, (avcdStateEntry) => {
                return avcdStateEntry[0] == "project_settings";
            }),
            projectSettings = _.find(avcdSettings[1].data, (settingsEntry) => {
                return settingsEntry[0] == this.meta.projectId;
            });
        this.settings = projectSettings[1].data;
        this.vars = this.settings.variables.data;
    }

    addColor(color) {
        var prevSavedVar = _.find(this.vars, function (varMeta) {
            return varMeta.data.value == color.getValue()
                && varMeta.data.name == color.getName()
        });
        if (!prevSavedVar){
            this.vars.push(color.toStateObject());
        }
    }

    addRegex(regex) {
        var prevSavedVar = _.find(this.vars, function (varMeta) {
            return varMeta.data.value == regex.getValue()
                && varMeta.data.name == regex.getName()
        });
        if (!prevSavedVar){
            this.vars.push(regex.toStateObject());
        }
    }

    getState() {
        return this.state;
    }

    getSettings() {
        return this.settings;
    }

    getProjectData() {
        return this.data;
    }

    getProjectId() {
        return this.meta.projectId;
    }
}

module.exports = AvocodeProject;

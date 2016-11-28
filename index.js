var fs = require('fs'),
    path = require('path'),
    util = require('util'),

    async = require('async'),
    _ = require('lodash'),

    AvocodeUser = require('./lib/user'),
    AvocodeColor = require('./lib/color'),
    AvocodeVariable = require('./lib/variable'),
    AvocodeProject = require('./lib/project'),
    AvocodeDocument = require('./lib/document');

/**
 *
 * @param {String|RegExp} projectIdentifier
 * @param {Object} [options]
 * @param {Object} [options.useJSONCache=false]
 * @param {Object} [options.userName="*"]
 * @constructor
 */
function Avocode(projectIdentifier, options) {
    var self = this;

    this.options = _.defaults(options, {
        useJSONCache: false,
        userName: '*'
    });

    this.docs = [];
    this.data = {
        colors: [],
        fonts: []
    };

    this.defaults = (function () {
        try {
            var defaultsStr = fs.readFileSync(path.join(__dirname, '/defaults.json'), {encoding: 'utf8'});
            return JSON.parse(defaultsStr);
        } catch (err) {
            console.error(err);
            return {}
        }
    })();

    this.config = {
        projectSelector: projectIdentifier,
        cache: {
            path: path.join(__dirname, '.cache')
        },
        state: {
            path: path.join(process.env.HOME, '.avocode/state.json')
        },
        documents: {
            path: null // will be set after state and user definition
        }
    };

    this._state = JSON.parse(fs.readFileSync(this.config.state.path, {encoding: 'utf8'}));

    this._user = new AvocodeUser(this.options.userName, this._state);

    this._project = new AvocodeProject(this.config.projectSelector, this._state);

    this.config.documents.path = (function () {
        var state = JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.avocode/state.json')));

        return path.join(process.env.HOME, util.format('.avocode/userdata/%s/documents/', self._user.getId()));
    })();
}

Avocode.prototype = {

    /**
     *
     * @param {Object} options
     * @param {Function} options.done
     * @param {Object} [options.context]
     */
    autofill: function (options) {
        var self = this,
            _options = _.extend({}, options),
            designProjects = _.chain(self._state.data)
                .find(function (stateEntry) {
                    return stateEntry[0] == 'user_data'
                })
                .get("[1].data.projects.data")
                .value(),
            designGroups = _.chain(designProjects)
                .find(function (designProjectMeta) {
                    return designProjectMeta.data.id == self._project.getProjectId();
                })
                .get("data.design_groups.data")
                .value(),
            fonts = [],
            colors = [];

        this.docs = [];

        async.forEachOf(designGroups,
            function parseDesignGroup(docGroup, index, done) {
                async.forEachOf(_.get(docGroup, "data.designs.data"),
                    function parseDesignDoc(docMeta, docIndex, onDocParsed) {
                        var docFileId = _.chain(docMeta)
                                .get('data.revisions.data')
                                .find(function (docMetaRevision) {
                                    return _.get(docMetaRevision, 'data.id') == _.get(docMeta, 'data.latest_revision_id');
                                })
                                .get('data.file_key')
                                .value()
                                .toString(),
                            docPath = path.join(self.config.documents.path, docFileId, 'data.json');
                        fs.readFile(docPath, {encoding: 'utf8'}, function (err, docJSON) {
                            if (err) {
                                console.log("ignoring '%s'", err.path);
                            } else {
                                var docData = JSON.parse(docJSON),
                                    avcdDocument = new AvocodeDocument(docData);
                                colors = colors.concat(avcdDocument.getColors());
                                fonts = fonts.concat(avcdDocument.getFonts());
                                self.docs.push(avcdDocument);
                                console.log('%s/%s - design groups parsed', index + 1, designGroups.length);
                            }
                            onDocParsed();
                        });
                    }, function onDesignGroupParsed() {
                        done();
                    })
            },

            function complete() {

                // concat default variables
                _.forEach(self.defaults.colors, function (colorData) {
                    colors.push(new AvocodeColor(null, colorData))
                });

                _.forEach(self.defaults.vars, function (varData) {
                    colors.push(new AvocodeVariable(varData.name, varData.value, varData.type))
                });

                // filter duplicates
                var colorNameHistoryMap = {};
                colors = _.chain(colors)
                    .uniqBy(function (avcdColor) {
                        return avcdColor.getValue();
                    })
                    .map(function (avcdColor) {
                        // ensure non duplicate names
                        var nameUsageCount = colorNameHistoryMap[avcdColor.getName()] || 0;
                        if (nameUsageCount > 0) {
                            avcdColor.setName(`${avcdColor.getName()}-v${nameUsageCount + 1}`)
                        }
                        nameUsageCount++;
                        colorNameHistoryMap[avcdColor.getName()] = nameUsageCount;
                        return avcdColor;
                    })
                    .value();

                fonts = _.uniqBy(fonts, function (avcdFont) {
                    return avcdFont.getName();
                });

                // update project
                _.forEach(colors, function (avcdColor) {
                    self._project.addColor(avcdColor);
                });

                _.forEach(fonts, function (avcdFont) {
                    self._project.addRegex(avcdFont);
                });

                self.saveProject(_options, _options.done);
            });
    },

    saveProject: function (options, done) {
        var self = this,
            hasOptions = _.isPlainObject(options),
            _options = hasOptions ? options : {},
            _writePath = this.config.state.path || path.join(process.cwd(), 'state.json'),
            updatedState = self._project.getState(),
            updateStateJSON = JSON.stringify(updatedState);
        if (done) {
            fs.writeFile(_writePath, updateStateJSON, {encoding: 'utf8'}, function (writeErr) {
                console.log('successfully updated state.json @ %s', self.config.state.path);
                done.apply(_options.context, [writeErr, self._project.getState()]);
            });
        } else {
            fs.writeFileSync(_writePath, updateStateJSON, {encoding: 'utf8'});
            console.log('successfully updated state.json @ %s', self.config.state.path);
        }

        if (this.options.useJSONCache) {

            try {
                fs.accessSync(self.config.cache.path, fs.W_OK);
            } catch (err) {
                console.error(err);
            }
            try {
                fs.mkdirSync(self.config.cache.path);
            } catch (err) {
                console.error(err);
            }

            try {
                fs.writeFileSync(path.join(self.config.cache.path, 'var.json'), JSON.stringify(self.data))
            } catch (err) {
                console.error(err);
            }
        }

    }
};

module.exports = Avocode;
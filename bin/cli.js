var util = require('util'),
    fs = require('fs'),
    path = require('path'),

    _ = require('lodash'),
    prompt = require('prompt'),
    async = require('async'),

    AvocodeProjectToolkit = require('../index');

var promptConfig = {
    userName: {
        properties: {
            userName: {
                type: 'string',
                description: 'Avocode user full name:',
                required: true
            }

        }
    },
    projectName: {
        properties: {
            projectName: {
                type: 'string',
                description: 'AvocodeProject project name:',
                required: true
            }
        }
    }
};

fs.readFile(path.join(process.cwd(), 'avocode.config.json'), function (err, configText) {
    var localConfig = {};
    if (err) {
        console.error(err.toString());
    } else {
        localConfig = JSON.parse(configText)
    }

    var envConfig = {
            projectName: process.env.AVOCODE_PROJECT,
            userName: process.env.AVOCODE_USER
        },
        avcdConfig = _.defaults(localConfig, envConfig);

    async.eachOfSeries(avcdConfig, function (configVal, configPropName, done) {
        if (!avcdConfig[configPropName]) {
            if (!prompt.started) prompt.start();
            prompt.get(promptConfig[configPropName], function (err, result) {
                avcdConfig[configPropName] = result[configPropName];
                done();
            });
        } else {
            done();
        }
    }, function complete() {
        prompt.stop();
        var avcdProject = new AvocodeProjectToolkit(avcdConfig['projectName'], {
            userName: avcdConfig['userName']
        });
        console.log('loading %s', avcdConfig['projectName']);
        avcdProject.autofill({
            done: function (colors, fonts) {
                console.log('done loading %s', avcdConfig['projectName']);
            }
        })
    });

});

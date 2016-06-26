const fs = require('fs');
const path = require('path');

const AlfredNode = require('alfred-workflow-nodejs');
const storage = AlfredNode.storage;

const git = require('./git-info.js');


const utils = {
    getDirectories: function(folderPath) {
        return fs.readdirSync(folderPath).filter(function(file) {
            return fs.statSync(path.join(folderPath, file)).isDirectory();
        });
    },

    detectProjectInfo: function(path, stashServer, callback) {
        // get from cache
        var projectsInfo = storage.get('projectsInfo');
        if (projectsInfo && projectsInfo[path]) {
            callback(projectsInfo[path]);
        } else {
            var info = {};
            utils.detectProjectType(path, function(projectType) {
                info.projectType = projectType;

                utils.detectGitInfo(path, stashServer, function(gitInfo) {
                    info.gitInfo = gitInfo;
                    if (!projectsInfo) {
                        projectsInfo = {};
                    }
                    projectsInfo[path] = info;
                    storage.set('projectsInfo', projectsInfo);
                    callback(info);
                })
            });
        }
    },

    detectProjectType: function(path, callback) {
        utils.isFileExists(path + '/pom.xml', function() {
            callback('java');
        }, function() {
            utils.isFileExists(path + '/package.json', function() {
                callback('nodejs');
            }, function() {
                callback(undefined);
            });
        });
    },

    detectGitInfo: function(path, stashServer, callback) {
        git.gitInfo(path, function(error, info) {
            callback(info);
        }, stashServer);
    },

    isFileExists: function(file, existsCallback, notFoundCallback) {
        fs.readFile(file, 'utf8', function(err, data) {
            if (err && err.code == 'ENOENT') {
                notFoundCallback();
            } else {
                existsCallback();
            }
        });
    },
};

module.exports = utils;

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
            var projectInfo = {
                projectType: utils.detectProjectType(path)
            };

            utils.detectGitInfo(path, stashServer, function(gitInfo) {
                projectInfo.gitInfo = gitInfo;
                if (!projectsInfo) {
                    projectsInfo = {};
                }
                projectsInfo[path] = projectInfo;
                storage.set('projectsInfo', projectsInfo);
                callback(projectInfo);
            });
        }
    },

    /**
     * Detect project type of a folder
     * @param  {string} - path path of a folder
     * @return {string} - project type
     */
    detectProjectType: function(path) {
        if (utils.isFileExists(path + '/pom.xml')) {
            return 'java';
        }

        if(utils.isFileExists(path + '/package.json')) {
            return 'nodejs';
        }

        return;
    },

    detectGitInfo: function(path, stashServer, callback) {
        git.gitInfo(path, function(error, info) {
            callback(info);
        }, stashServer);
    },

    /**
     * Check a file is exist or not
     * @param  {string} filePath - file path
     * @return {boolean} returns true if file is exist or otherwise returns false
     */
    isFileExists: function(filePath) {
        try {
            fs.accessSync(filePath);
            return true;
        } catch (e) {
            return false;
        }

        return false;
    },
};

module.exports = utils;

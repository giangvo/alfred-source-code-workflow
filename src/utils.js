const fs = require('fs');
const path = require('path');
const { storage } = require('alfred-workflow-nodejs-next');

const git = require('./git-info.js');
const config = require('../config.json');
const sourceFolders = config['source-folders'];
const sources = config['sources'];
const stashServer = config['stash-server'];

const utils = {
    getDirectories: function(folderPath) {
        const folder = fs.readdirSync(folderPath)
        return folder.filter((file) => fs.statSync(path.join(folderPath, file)).isDirectory());
    },

    detectProjectInfo: function(path, callback) {
        const keyCache = 'projectsInfo';

        // get from cache
        let projectsInfo = storage.get(keyCache) || {};
        if (projectsInfo[path]) {
            callback(projectsInfo[path]);
            return;
        }

        const projectInfo = {
            projectType: utils.detectProjectType(path)
        };

        utils.detectGitInfo(path, function(gitInfo) {
            projectInfo.gitInfo = gitInfo;
            projectsInfo[path] = projectInfo;

            storage.set(keyCache, projectsInfo);
            callback(projectInfo);
        });
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

    detectGitInfo: function(path, callback) {
        git.gitInfo(path, function(error, info) {
            if (error) {
                console.warn('Can not detect git info', error, path);
                return;
            }

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

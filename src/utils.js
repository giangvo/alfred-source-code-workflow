'use strict';

const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const {storage} = require('alfred-workflow-nodejs-next');

const git = require('./git-info.js');
// eslint-disable-next-line node/no-unpublished-require
const config = require('../config.json');
const stashServer = config['stash-server'];

const utils = {
  getDirectories: function (folderPath) {
    const folder = fs.readdirSync(folderPath);
    return folder.filter((file) => fs.statSync(path.join(folderPath, file)).isDirectory());
  },

  /**
   * Build project info from list of paths. Return list of project info
   * Here is example of project info
   * projectsInfo: {
   *      projectType: 'nodejs',
   *      gitInfo: {
   *          server: 'bitbucket',
   *          repo: 'the-repo',
   *          project: 'the-project',
   *          branch: 'master',
   *          url: 'git@bitbucket.org:the-project/the-repo.git',
   *          link: 'https://bitbucket.org/the-project/the-repo',
   *          prsLink: 'https://bitbucket.org/the-project/the-repo/pull-requests',
   *          prLink: 'https://bitbucket.org/the-project/the-repo/pull-requests?query=master',
   *          createPrLink: 'https://bitbucket.org/the-project/the-repo/pull-requests/new?source=master',
   *          gitRootPath: 'the-git-root-path'
   *      }
   * }
   */
  detectProjectsInfo: async function (paths) {
    const keyCache = 'projectsInfo';
    let newInfoDetected = false;

    // get all projects info from cache
    let projectsInfo = storage.get(keyCache) || {};
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];

      let projectInfo = projectsInfo[path];
      // if info of a project is not in cache => build it
      if (!projectInfo) {
        console.warn(`Building project info ${path}`);
        projectInfo = {
          projectType: utils.detectProjectType(path)
        };

        const gitInfo = await utils.detectGitInfo(path);
        if (gitInfo) {
          projectInfo.gitInfo = gitInfo;
        }

        projectsInfo[path] = projectInfo;
        newInfoDetected = true;
      }
    }

    if (newInfoDetected) {
      storage.set(keyCache, projectsInfo);
    }

    return projectsInfo;
  },

  /**
   * Detect project type of a folder
   * @return {string} - project type
   * @param path - path of a folder
   */
  detectProjectType: function (path) {
    if (utils.isFileExists(path + '/pom.xml')) {
      return 'java';
    }

    if (utils.isFileExists(path + '/package.json')) {
      return 'nodejs';
    }

    return;
  },

  detectGitInfo: async function (path) {
    try {
      return await git.gitInfo(path, stashServer);
    } catch (err) {
      console.warn(err);
    }
  },

  /**
   * Check a file is exist or not
   * @param  {string} filePath - file path
   * @return {boolean} returns true if file is exist or otherwise returns false
   */
  isFileExists: function (filePath) {
    try {
      fs.accessSync(filePath);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Execute a command
   */
  exec: function (command) {
    return new Promise((resolve, reject) => {
      exec(command, function (error, stdout) {
        if (error || !stdout) {
          reject(`Error running command: ${command}`);
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }
};

module.exports = utils;

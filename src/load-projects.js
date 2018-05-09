'use strict';

const {
  ICONS,
  Item,
  storage,
  utils: nodeJSUtils
} = require('alfred-workflow-nodejs-next');

// eslint-disable-next-line node/no-unpublished-require
const config = require('../config.json');
const sourceContainers = config['source-containers'];
const sources = config['sources'];

const utils = require('./utils');

class LoadProjects {
  constructor (options) {
    this.workflow = options.workflow;
  }

  async run (query) {
    let projects = [];

    // get from cache
    const keyCache = 'load_projects';
    const data = storage.get(keyCache);
    if (data) {
      console.warn('Load all projects from cache :)');
      projects = data;
    } else {
      console.warn('Load all projects from hard disk! :(');
      sourceContainers.forEach((path) => {
        const folders = utils.getDirectories(path);

        folders.forEach((folder) => {
          projects.push({
            name: folder,
            path: path + '/' + folder
          });
        });
      });

      if (sources) {
        Object.entries(sources)
          .forEach(([name, path]) => {
            projects.push({
              name: name,
              path: path
            });
          })
      }
      // cache in 24h
      storage.set(keyCache, projects);
    }


    if (projects.length === 0) {
      this.workflow.addItem(new Item({
        title: 'No project path configured. Enter to open config file.',
        icon: ICONS.INFO,
        valid: true
        // arg: JSON.stringify({
        //     action: OpenConfigFileAction.actionName
        // })
      }));

      this.workflow.feedback();
      return;
    }

    const filteredProjects = nodeJSUtils.filter(query, projects, (item) => {
      return item.name.toLowerCase() + ' ' + item.name.toLowerCase().replace(/-/g, ' ');
    });

    const paths = filteredProjects.map(p => p.path);
    const projectInfos = await utils.detectProjectsInfo(paths);

    filteredProjects.forEach(project => {
      const {
        name,
        path
      } = project;

      const projectInfo = projectInfos[path];
      if (!projectInfo) {
        console.warn(`No info found for project ${path}`);
        return;
      }
      const projectType = projectInfo.projectType;

      const arg = {
        name,
        path,
        gitInfo: projectInfo.gitInfo || undefined,
        projectType
      };

      this.workflow.addItem(new Item({
        uid: path,
        title: name,
        subtitle: path,
        icon: 'icons/' + (projectType ? projectType : 'folder') + '.png',
        hasSubItems: true,
        valid: false,

        // arg is passed to as `selectedData` argument in handler `workflow.onMenuItemSelected(commands.LOAD_PROJECTS)`
        arg: JSON.stringify(arg)
      }));
    });

    this.workflow.feedback();
  }
}

module.exports = LoadProjects;

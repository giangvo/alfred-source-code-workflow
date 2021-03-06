'use strict';

const {Workflow, storage} = require('alfred-workflow-nodejs-next');
const executors = require('./executors');
const utils = require('./utils');

const commands = {
  LOAD_PROJECTS: 'loadProjects',
  EXECUTE: 'execute',
  CLEAR_CACHE: 'clear_cache',
  EDIT_CONFIG: 'edit_config'
};

const LoadProjects = require('./load-projects');
const LoadProjectAction = require('./load-project-actions');

(function main () {
  const workflow = new Workflow();
  workflow.setName('alfred-source-code-wf');

  const loadProjects = new LoadProjects({
    workflow
  });
  const loadProjectAction = new LoadProjectAction({
    workflow
  });

  // load projects list
  workflow.onAction(commands.LOAD_PROJECTS, (query) => {
    loadProjects.run(query);
  });
  // load project's actions
  workflow.onSubActionSelected(commands.LOAD_PROJECTS, (query, previousSelectedTitle, previousSelectedArg) => {
    loadProjectAction.run(query, previousSelectedArg);
  });

  // execute project action
  workflow.onAction(commands.EXECUTE, function (arg) {
    // Handle project actions
    Object.values(executors).forEach((executor) => {
      executor.execute(arg);
    });
  });

  // open config file
  workflow.onAction(commands.EDIT_CONFIG, function () {
    utils.exec('open config.json');
  });

  // clear cache
  workflow.onAction(commands.CLEAR_CACHE, () => {
    storage.clear();
  });

  workflow.start();
})();

const { Workflow, Item, ICONS, utils: nodeJSUtils } = require('alfred-workflow-nodejs-next');
const executors = require('./executors.js');
const utils = require('./utils');

const commands = {
    LOAD_PROJECTS: 'loadProjects',
    EXECUTE: 'execute'
};

const LoadProjects = require('./load-projects');
const LoadProjectAction = require('./load-project-actions');

(function main() {
    const workflow = new Workflow();
    workflow.setName('alfred-source-code-wf');

    const loadProjects = new LoadProjects({
        workflow
    });
    const loadProjectAction = new LoadProjectAction({
        workflow
    });

    // load projects list
    workflow.onAction(commands.LOAD_PROJECTS, function(query) {
        loadProjects.run(query);
    });
    // load project's actions
    workflow.onMenuItemSelected(commands.LOAD_PROJECTS, function(query, selectedTitle, selectedData) {
        const arg = JSON.parse(selectedData.arg);
        loadProjectAction.run(query, arg);
    });

    // execute project action
    workflow.onAction(commands.EXECUTE, function(arg) {
        // Handle project actions
        executors.forEach((executor) => {
            executor.execute(arg);
        });
    });

    // open config file
    // actionHandler.onAction('config', function(query) {
    //     OpenConfigFileAction.execute();
    // });

    workflow.start();
})();
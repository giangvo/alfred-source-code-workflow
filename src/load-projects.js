const { ICONS, Item, utils: nodeJSUtils } = require('alfred-workflow-nodejs-next');

const config = require('../config.json');
const sourceFolders = config['source-folders'];

const utils = require('./utils');

class LoadProjects {
    constructor(options) {
        this.workflow = options.workflow;
    }

    run(query) {
        const projects = [];

        sourceFolders.forEach((path) => {
            const folders = utils.getDirectories(path);

            folders.forEach((folder) => {
                projects.push({
                    name: folder,
                    path: path + '/' + folder
                });
            });
        });

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
            return item.name.toLowerCase() + ' ' + item.name.toLowerCase().replace(/\-/g, ' ');
        });

        filteredProjects.forEach((project) => {
            const { name, path } = project;

            utils.detectProjectInfo(path, (info) => {
                const { gitInfo, projectType } = info;

                this.workflow.addItem(new Item({
                    uid: path,
                    title: name,
                    subtitle: path,
                    icon: 'icons/' + (projectType ? projectType : 'folder') + '.png',
                    hasSubItems: true,
                    valid: false,

                    // arg is passed to as `selectedData` argument in handler `workflow.onMenuItemSelected(commands.LOAD_PROJECTS)`
                    arg: JSON.stringify({
                        name,
                        path,
                        link: gitInfo,
                        projectType,
                        gitInfo
                    })
                }));
            });
        });

        this.workflow.feedback();
    }
}

module.exports = LoadProjects
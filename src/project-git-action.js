const ProjectAction = require('./project-action');

class ProjectGitAction extends ProjectAction {
    constructor(options) {
        super(options);
    }

    shouldDisplay(data) {
        return data.gitInfo !== undefined;
    }

    getIcon(data) {
        return 'icons/' + data.gitInfo.server + '.png';
    }
};


module.exports = ProjectGitAction;

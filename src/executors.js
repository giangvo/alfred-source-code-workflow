const exec = require('child_process').exec;
const { utils } = require('alfred-workflow-nodejs-next');

const Executor = require('./Executor');
const ProjectAction = require('./ProjectAction');
const ProjectGitAction = require('./project-git-action');

const openInFinderAction = new ProjectAction({
    key: 'open_in_finder',
    name: 'Open in Finder',
    icon: 'finder.png',
    executor: (data) => {
        const command = `open ${data.path}`;
        return exec(command);
    }
});

const OpenInItermAction = new ProjectAction({
    name: 'Open in Iterm',
    icon: 'iterm.png',
    executor: (data) => {
        const OPEN_IN_ITERM_AS =
            'tell application "iTerm"\n' +
            'activate\n' +
            'tell current window\n' +
            'set newTab to (create tab with default profile)\n' +
            'tell last session of newTab\n' +
            'write text "cd " & quoted form of "%s"\n' +
            'end tell\n' +
            'end tell\n' +
            'end tell\n';
        const script = OPEN_IN_ITERM_AS.replace('%s', data.path);
        utils.applescript.execute(script);
    }
});

const OpenInNewItermSplitPanelAction = new ProjectAction({
    name: 'Open in Iterm in new split panel',
    icon: 'iterm.png',
    executor: (data) => {
        const OPEN_IN_ITERM_NEW_SPLIT_PANEL_AS =
            'tell application "iTerm"\n' +
            'activate\n' +
            'tell current window\n' +
            'tell current session\n' +
            'set newSession to (split horizontally with default profile)\n' +
            'tell newSession\n' +
            'write text "cd " & quoted form of "%s"\n' +
            'end tell\n' +
            'end tell\n' +
            'end tell\n' +
            'end tell\n';

        const script = OPEN_IN_ITERM_NEW_SPLIT_PANEL_AS.replace('%s', data.path);
        utils.applescript.execute(script);
    }
});

const OpenInItermCurrentSessionAction = new ProjectAction({
    name: 'Open in Iterm at current tab',
    icon: 'iterm.png',
    executor: (data) => {
        const OPEN_IN_ITERM_CURRENT_SESSION_AS =
            'tell application "iTerm"\n' +
            'activate\n' +
            'tell current window\n' +
            'tell current session\n' +
            'write text "cd " & quoted form of "%s"\n' +
            'end tell\n' +
            'end tell\n' +
            'end tell\n';

        const script = OPEN_IN_ITERM_CURRENT_SESSION_AS.replace('%s', data.path);
        utils.applescript.execute(script);
    }
});

const openInSublimeAction = new ProjectAction({
    key: 'open_in_sublime',
    name: 'Open in Sublime',
    icon: 'sublime.png',
    executor: (arg) => {
        const command = `/usr/local/bin/subl --stay ${arg.path}`;
        return exec(command);
    }
});


const openInIDEA = new ProjectAction({
    name: 'open_in_idea',
    name: 'Open in IntelliJ IDEA',
    icon: 'idea.png',
    executor: (data) => {
        const command = `/usr/local/bin/idea ${data.path}`;
        return exec(command);
    }
});

const OpenInWebStorm = new ProjectAction({
    name: 'Open in WebStorm',
    icon: 'wstorm.icns',
    executor: (data) => exec(`./bin/wstorm ${data.path}`)
});


const openInSourceTree = new ProjectGitAction({
    key: 'open_in_source_tree',
    name: 'Open in Source Tree',
    shortcut: 'st',
    icon: 'sourcetree.png',
    executor: (data) => {
        const command = `open -a SourceTree ${data.path}`;
        return exec(command);
    }
});

openInSourceTree.getIcon = function(data) {
    return this.icon;
}

const OpenRepoLink = new ProjectGitAction({
    name: 'Open Repo Link',
    shortcut: 'repo',
    executor: (data) => {
        const info = data.gitInfo;
        exec(`open ${info.link}`);
    }
});

OpenRepoLink.getSubTitle = (data) => data.gitInfo.link;

const CreatePullRequest = new ProjectGitAction({
    name: 'Create Pull Request',
    shortcut: 'cpr',
    executor: (data) => {
        const info = data.gitInfo;
        exec(`open ${info.createPrLink}`);
    }
});

CreatePullRequest.getSubTitle = (data) => data.gitInfo.createPrLink;


const OpenPullRequests = new ProjectGitAction({
    name: 'Open Pull Requests',
    shortcut: 'prs',
    executor: (data) => {
        const info = data.gitInfo;
        exec(`open ${info.prsLink}`);
    }
});

OpenPullRequests.getSubTitle = (data) => data.gitInfo.prsLink;

// end of git actions

// Open config file action
const OpenConfigFileAction = new Executor({
    name: 'Open Config File',
    executor: (arg) => exec('open config.json')
});

module.exports = [
    openInFinderAction,
    OpenInItermAction,
    OpenInItermCurrentSessionAction,
    OpenInNewItermSplitPanelAction,
    openInSublimeAction,
    openInIDEA,
    OpenInWebStorm,
    openInSourceTree,
    OpenRepoLink,
    CreatePullRequest,
    OpenPullRequests,
    OpenConfigFileAction
];

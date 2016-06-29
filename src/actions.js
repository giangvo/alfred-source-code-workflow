/**
 * Define list of actions for a project (source dir)
 */
var exec = require('child_process').exec;
var AlfredNode = require('alfred-workflow-nodejs');
var utils = AlfredNode.utils;

const Action = require('./action');
const ProjectAction = require('./project-action');
const ProjectGitAction = require('./project-git-action');

var OpenInFinderAction = new ProjectAction({
    actionName: 'Open in Finder',
    icon: 'finder.png',
    executor: (data) => exec(`open ${data.path}`)
});

var OPEN_IN_ITERM_AS =
    'tell application "iTerm"\n' +
    'activate\n' +
    'tell current window\n' +
    'set newTab to (create tab with default profile)\n' +
    'tell last session of newTab\n' +
    'write text "cd " & quoted form of "%s"\n' +
    'end tell\n' +
    'end tell\n' +
    'end tell\n'
var OpenInItermAction = new ProjectAction({
    actionName: 'Open in Iterm',
    icon: 'iterm.png',
    executor: (data) => {
        var script = OPEN_IN_ITERM_AS.replace('%s', data.path);
        utils.applescript.execute(script);
    }
});

var OPEN_IN_ITERM_NEW_SPLIT_PANEL_AS =
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

var OpenInNewItermSplitPanelAction = new ProjectAction({
    actionName: 'Open in Iterm in new split panel',
    icon: 'iterm.png',
    executor: (data) => {
        var script = OPEN_IN_ITERM_NEW_SPLIT_PANEL_AS.replace('%s', data.path);
        utils.applescript.execute(script);
    }
});

var OPEN_IN_ITERM_CURRENT_SESSION_AS =
    'tell application "iTerm"\n' +
    'activate\n' +
    'tell current window\n' +
    'tell current session\n' +
    'write text "cd " & quoted form of "%s"\n' +
    'end tell\n' +
    'end tell\n' +
    'end tell\n';

var OpenInItermCurrentSessionAction = new ProjectAction({
    actionName: 'Open in Iterm at current tab',
    icon: 'iterm.png',
    executor: (data) => {
        var script = OPEN_IN_ITERM_CURRENT_SESSION_AS.replace('%s', data.path);
        utils.applescript.execute(script);
    }
});

var OpenInSublimeAction = new ProjectAction({
    actionName: 'Open in Sublime',
    icon: 'sublime.png',
    executor: (data) => exec(`/usr/local/bin/subl --stay ${data.path}`)
});

var OpenInAtom = new ProjectAction({
    actionName: 'Open in Atom editor',
    icon: 'atom.png',
    executor: (data) => exec(`/usr/local/bin/atom ${data.path}`)
});


var OpenInIDEA = new ProjectAction({
    actionName: 'Open in IntelliJ IDEA',
    icon: 'idea.png',
    executor: (data) => exec(`./bin/idea ${data.path}`)
});

var OpenInWebStorm = new ProjectAction({
    actionName: 'Open in WebStorm',
    icon: 'wstorm.icns',
    executor: (data) => exec(`./bin/wstorm ${data.path}`)
});


var OpenInSourceTree = new ProjectGitAction({
    actionName: 'Open in Source Tree',
    shortcut: 'st',
    icon: 'icons/sourcetree.png',
    executor: (data) => exec(`open -a SourceTree ${data.path}`)
});

OpenInSourceTree.getIcon = function(data) {
    return this.icon;
}

var OpenRepoLink = new ProjectGitAction({
    actionName: 'Open Repo Link',
    shortcut: 'repo',
    executor: (data) => {
        var info = data.gitInfo;
        exec(`open ${info.link}`);
    }
});

OpenRepoLink.getSubTitle = (data) => data.gitInfo.link;

var CreatePullRequest = new ProjectGitAction({
    actionName: 'Create Pull Request',
    shortcut: 'cpr',
    executor: (data) => {
        var info = data.gitInfo;
        exec(`open ${info.createPrLink}`);
    }
});

CreatePullRequest.getSubTitle = (data) => data.gitInfo.createPrLink;


var OpenPullRequests = new ProjectGitAction({
    actionName: 'Open Pull Requests',
    shortcut: 'prs',
    executor: (data) => {
        var info = data.gitInfo;
        exec(`open ${info.prsLink}`);
    }
});

OpenPullRequests.getSubTitle = (data) => data.gitInfo.prsLink;

// end of git actions

// Open config file action
var OpenConfigFileAction = new Action({
    actionName: 'Open Config File',
    executor: (arg) => exec('open config.json')
});

module.exports = {
    "projectActions": [
        OpenInFinderAction,
        OpenInItermAction,
        OpenInItermCurrentSessionAction,
        OpenInNewItermSplitPanelAction,
        OpenInSublimeAction,
        OpenInAtom,
        OpenInIDEA,
        OpenInWebStorm,
        OpenInSourceTree,
        OpenRepoLink,
        CreatePullRequest,
        OpenPullRequests
    ],

    OpenConfigFileAction
};

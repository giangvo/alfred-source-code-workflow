'use strict';

const exec = require('child_process').exec;
const {utils} = require('alfred-workflow-nodejs-next');

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

const openInItermAction = new ProjectAction({
  key: 'open_in_iterm_new_tab',
  name: 'Open in Iterm (new tab)',
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

const openInNewItermSplitPanelAction = new ProjectAction({
  key: 'open_in_iterm_new_split_panel',
  name: 'Open in Iterm (new split panel)',
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

const openInItermCurrentSessionAction = new ProjectAction({
  key: 'open_in_iterm_current_session',
  name: 'Open in Iterm (current session)',
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
  key: 'open_in_idea',
  name: 'Open in IntelliJ IDEA',
  icon: 'idea.png',
  executor: (data) => {
    const command = `/usr/local/bin/idea ${data.path}`;
    return exec(command);
  }
});

const openInWebStorm = new ProjectAction({
  key: 'open_in_webstorm',
  name: 'Open in WebStorm',
  icon: 'wstorm.icns',
  executor: (data) => exec(`./bin/wstorm ${data.path}`)
});

const openInVSCode = new ProjectAction({
  key: 'open_in_vscode',
  name: 'Open in Visual Studio Code',
  icon: 'vscode.jpg',
  executor: (data) => {
    const command = `/usr/local/bin/code ${data.path}`;
    return exec(command);
  }
});

const openInSourceTree = new ProjectGitAction({
  key: 'open_in_source_tree',
  name: 'Open in Source Tree',
  shortcut: 'st',
  icon: 'sourcetree.png',
  executor: (data) => {
    const command = `open -a SourceTree ${data.path}`;
    return exec(command);
  },
  getIcon: () => {
    return this.icon;
  }
});

const openRepoLink = new ProjectGitAction({
  key: 'open_repo_link',
  name: 'Open Repo Link',
  shortcut: 'repo',
  executor: (data) => {
    const command = `open ${data.gitInfo.link}`;
    return exec(command);
  },
  getSubTitle: (data) => data.gitInfo.link
});

const createPullRequest = new ProjectGitAction({
  name: 'Create Pull Request',
  shortcut: 'cpr',
  executor: (data) => {
    const info = data.gitInfo;
    exec(`open ${info.createPrLink}`);
  }
});

createPullRequest.getSubTitle = (data) => data.gitInfo.createPrLink;


const openPullRequests = new ProjectGitAction({
  name: 'Open Pull Requests',
  shortcut: 'prs',
  executor: (data) => {
    const info = data.gitInfo;
    exec(`open ${info.prsLink}`);
  }
});

openPullRequests.getSubTitle = (data) => data.gitInfo.prsLink;

// end of git actions

module.exports = [
  openInFinderAction,
  openInVSCode,
  openInItermAction,
  openInItermCurrentSessionAction,
  openInNewItermSplitPanelAction,
  openInSublimeAction,
  openInIDEA,
  openInWebStorm,
  openInSourceTree,
  openRepoLink,
  createPullRequest,
  openPullRequests
];

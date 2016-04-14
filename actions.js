/**
 * Define list of actions for a project (source dir)
 */
var _ = require('underscore');
var exec = require('child_process').exec;
var AlfredNode = require('alfred-workflow-nodejs');
var Item = AlfredNode.Item;
var utils = AlfredNode.utils;

var Action = function(options) {
    this.actionName = options.actionName;
    this.executor = options.executor;
};

Action.prototype.execute = function(arg) {
    this.executor(arg);
};

var ProjectAction = function(options) {
    Action.call(this, options);
    this.shortcut = options.shortcut || '';
    this.icon = options.icon;
};

ProjectAction.prototype = Object.create(Action.prototype);

ProjectAction.prototype.shouldDisplay = function(data) {
    return true;
}

ProjectAction.prototype.build = function(data, callback) {
    if (this.shouldDisplay(data)) {
        var that = this;
        callback(new Item({
            uid: this.actionName,
            title: this.actionName,
            subtitle: this.getSubTitle(data),
            icon: this.getIcon(data),
            hasSubItems: false,
            valid: true,
            arg: JSON.stringify(_.extend({
                action: that.actionName
            }, data))
        }));
    } else {
        callback(undefined);
    }

};

ProjectAction.prototype.execute = function(arg) {
    var data = JSON.parse(arg);

    if (data.action === this.actionName) {
        this.executor(data);
    }
};

ProjectAction.prototype.getSubTitle = function(data) {
    return data.path;
}

ProjectAction.prototype.getIcon = function() {
    return 'icons/' + this.icon;
}

ProjectAction.prototype.filterKey = function() {
    return this.actionName + (this.shortcut ? ' ' + this.shortcut : '');
}

var OpenInFinderAction = new ProjectAction({
    actionName: 'Open in Finder',
    icon: 'finder.png',
    executor: function(data) {
        exec('open "' + data.path + '"');
    }
});

var OPEN_IN_ITERM_AS = 'tell application "iTerm"\n' + 'activate\n' + 'set myterm to (current terminal)\n' + 'tell myterm\n' + 'launch session "Default Session"\n' + 'tell the last session\n' + 'write text "cd " & quoted form of "%s"\n' + 'end tell\n' + 'end tell\n' + 'end tell\n'
var OpenInItermAction = new ProjectAction({
    actionName: 'Open in Iterm',
    icon: 'iterm.png',
    executor: function(data) {
        var script = OPEN_IN_ITERM_AS.replace('%s', data.path);
        utils.applescript.execute(script);
    }
});

var OpenInSublimeAction = new ProjectAction({
    actionName: 'Open in Sublime',
    icon: 'sublime.png',
    executor: function(data) {
        exec('/usr/local/bin/subl --stay "' + data.path + '"');
    }
});

var OpenInIDEA = new ProjectAction({
    actionName: 'Open in IntelliJ IDEA',
    icon: 'idea.png',
    executor: function(data) {
        exec('./idea "' + data.path + '"');
    }
});

OpenInIDEA.shouldDisplay = function(data) {
    return data.projectType === 'java';
}
// start of git actions
var ProjectGitAction = function(options) {
    ProjectAction.call(this, options);
};

ProjectGitAction.prototype = Object.create(ProjectAction.prototype);

ProjectGitAction.prototype.shouldDisplay = function(data) {
    return data.gitInfo !== undefined;
}

ProjectGitAction.prototype.getIcon = function(data) {
    return 'icons/' + data.gitInfo.server + '.png';
}

var OpenInSourceTree = new ProjectGitAction({
    actionName: 'Open in Source Tree',
    shortcut: 'st',
    icon: 'icons/sourcetree.png',
    executor: function(data) {
        exec('open -a SourceTree "' + data.path + '"');
    }
});

OpenInSourceTree.getIcon = function(data) {
    return this.icon;
}

var OpenRepoLink = new ProjectGitAction({
    actionName: 'Open Repo Link',
    shortcut: 'repo',
    executor: function(data) {
        var info = data.gitInfo;
        exec('open "' + info.link + '"');
    }
});

OpenRepoLink.getSubTitle = function(data) {
    return data.gitInfo.link;
}

var CreatePullRequest = new ProjectGitAction({
    actionName: 'Create Pull Request',
    shortcut: 'cpr',
    executor: function(data) {
        var info = data.gitInfo;
        exec('open "' + info.createPrLink + '"');
    }
});

CreatePullRequest.getSubTitle = function(data) {
    return data.gitInfo.createPrLink;
}

var OpenPullRequests = new ProjectGitAction({
    actionName: 'Open Pull Requests',
    shortcut: 'prs',
    executor: function(data) {
        var info = data.gitInfo;
        exec('open "' + info.prsLink + '"');
    }
});

OpenPullRequests.getSubTitle = function(data) {
    return data.gitInfo.prsLink;
}

// end of git actions

// Open config file action
var OpenConfigFileAction = new Action({
    actionName: 'Open Config File',
    executor: function(arg) {
        exec('open config.json');
    }
});

module.exports = {
    "projectActions": [
        OpenInFinderAction,
        OpenInItermAction,
        OpenInSublimeAction,
        OpenInIDEA,
        OpenInSourceTree,
        OpenRepoLink,
        CreatePullRequest,
        OpenPullRequests
    ],

    "OpenConfigFileAction": OpenConfigFileAction
};
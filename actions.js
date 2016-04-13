/**
 * Define list of actions for a project (source dir)
 */
var exec = require('child_process').exec;
var AlfredNode = require('alfred-workflow-nodejs');
var Item = AlfredNode.Item;
var utils = AlfredNode.utils;

var git = require('./git-info.js');

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

ProjectAction.prototype.build = function(data, callback) {
    data.action = this.actionName;

    callback(new Item({
        uid: this.actionName,
        title: this.actionName,
        subtitle: this.getSubTitle(data),
        icon: this.getIcon(),
        hasSubItems: false,
        valid: true,
        arg: JSON.stringify(data)
    }));
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
        exec('/usr/local/bin/subl --stay -a "' + data.path + '"');
    }
});

var OpenInIDEA = new ProjectAction({
    actionName: 'Open in IntelliJ IDEA',
    icon: 'idea.png',
    executor: function(data) {
        exec('./idea "' + data.path + '"');
    }
});

// start of git actions
var ProjectGitAction = function(options) {
    ProjectAction.call(this, options);
};

ProjectGitAction.prototype = Object.create(ProjectAction.prototype);

ProjectGitAction.prototype.build = function(data, callback) {
    data.action = this.actionName;

    var that = this;

    _gitInfo(
        data.path,
        function(info) {
            callback(new Item({
                uid: that.actionName,
                title: that.actionName,
                subtitle: that.getSubTitle(data, info),
                icon: 'icons/' + info.server + '.png',
                hasSubItems: false,
                valid: true,
                arg: JSON.stringify(data)
            }));
        },
        function() {
            callback(undefined);
        }
    );
}

var OpenInSourceTree = new ProjectGitAction({
    actionName: 'Open in Source Tree',
    shortcut: 'st',
    icon: 'sourcetree.png',
    executor: function(data) {
        exec('open -a SourceTree "' + data.path + '"');
    }
});

var OpenRepoLink = new ProjectGitAction({
    actionName: 'Open Repo Link',
    shortcut: 'repo',
    executor: function(data) {
        _gitInfo(data.path, function(info) {
            exec('open "' + info.link + '"');
        });
    }
});

OpenRepoLink.getSubTitle = function(data, gitInfo) {
    return gitInfo.link;
}

var OpenPullRequests = new ProjectGitAction({
    actionName: 'Open Pull Requests',
    shortcut: 'prs',
    executor: function(data) {
        _gitInfo(data.path, function(info) {
            exec('open "' + info.prsLink + '"');
        });
    }
});

OpenPullRequests.getSubTitle = function(data, gitInfo) {
    return gitInfo.prsLink;
}

var CreatePullRequest = new ProjectGitAction({
    actionName: 'Create Pull Request',
    shortcut: 'cpr',
    executor: function(data) {
        _gitInfo(data.path, function(info) {
            exec('open "' + info.createPrLink + '"');
        });
    }
});

CreatePullRequest.getSubTitle = function(data, gitInfo) {
    return gitInfo.createPrLink;
}

// end of git actions

// Open config file action
var OpenConfigFileAction = new Action({
    actionName: 'Open Config File',
    executor: function(arg) {
        exec('open config.json');
    }
});

var _gitInfo = function(path, foundCallback, notFoundCallback) {
    git.gitInfo(path, function(info) {
        if (info) {
            foundCallback(info);
        } else {
            if (notFoundCallback) {
                notFoundCallback()
            };
        }
    }, false, 'stash.atlassian.com');
}

module.exports = {
    "projectActions": [
        OpenInFinderAction,
        OpenInItermAction,
        OpenInSublimeAction,
        OpenInIDEA,
        OpenInSourceTree,
        OpenRepoLink,
        OpenPullRequests,
        CreatePullRequest
    ],

    "OpenConfigFileAction": OpenConfigFileAction
};
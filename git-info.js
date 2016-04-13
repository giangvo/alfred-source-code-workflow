#!/usr/bin/env node

var exec = require('child_process').exec;
var fs = require("fs");
var utils = require("util");
var _ = require("underscore");

/**
 * @param callback git info found callback
 * @param tryParent try to look for git info in parent folder (usefull when run command in sub folder)
 * Return current repo information
 */
var gitInfo = function(path, callback, tryParent, stashServer) {
    fs.readFile(path + "/.git/config", "utf8", function(err, data) {
        if (err && err.code == "ENOENT") {
            if (tryParent) {
                // if cannot find git config folder
                // try to look in parent
                fs.readFile(path + "/../.git/config", "utf8", function(err, data) {
                    if (err && err.code == "ENOENT") {
                        console.log("Not a git repo!");
                        return;
                    }

                    _gitConfigFoundCallback(stashServer, data, callback, false);
                });
            }
        } else {
            _gitConfigFoundCallback(stashServer, data, callback, true);
        }
    });
}

var gitBranch = function(callback) {
    exec("git rev-parse --abbrev-ref HEAD", function(error, stdout, stderr) {
        callback(stdout.trim());
    });
}

// start of private methods

var _gitConfigFoundCallback = function(stashServer, data, callback, isGitRoot) {

    var repo = _parseGitConfig(stashServer, data);
    if (repo) {
        repo.isGitRoot = isGitRoot;

        gitBranch(function(branch) {
            repo.branch = branch;

            // update source branch for create pr link
            if (repo.server === "stash" || repo.server === "bitbucket") {
                repo.createPrLink = repo.createPrLink + repo.branch;
            }

            callback(repo);
        });
    } else {
        console.log("No repo link found!");
    }
}

var _parseGitConfig = function(stashServer, data) {
    var gitConfig;

    var lines = data.split("\n");

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.indexOf("url") === 1) {
            gitConfig = _getBitButketInfo(line);
            if (gitConfig) {
                break;
            }

            gitConfig = _getGithubInfo(line);
            if (gitConfig) {
                break;
            }

            if (stashServer) {
                gitConfig = _getStashInfo(line, stashServer);
            }

            break;
        }
    };

    return gitConfig;
}

var _getBitButketInfo = function(line) {
    var BITBUCKET_SSH_URL_PATTERN = /url = git@bitbucket\.org:(.*)\/(.*)\.git/
    var BITBUCKET_HTTP_URL_PATTERN = /url = https:\/\/(.*)@bitbucket\.org\/(.*)\/(.*).git/
    var BITBUCKET_REPO_LINK = "https://bitbucket.org/%s/%s"
    var BITBUCKET_REPO_PRS_LINK = "https://bitbucket.org/%s/%s/pull-requests"
    var BITBUCKET_CREATE_PR_LINK = "https://bitbucket.org/%s/%s/pull-requests/new?source="

    var result = line.match(BITBUCKET_SSH_URL_PATTERN);
    var project, repo;
    if (result) {
        project = result[1];
        repo = result[2];

    } else {
        result = line.match(BITBUCKET_HTTP_URL_PATTERN);

        if (result) {
            project = result[2];
            repo = result[3];
        }
    }

    if (project && repo) {
        return {
            server: "bitbucket",
            link: utils.format(BITBUCKET_REPO_LINK, project, repo),
            prsLink: utils.format(BITBUCKET_REPO_PRS_LINK, project, repo),
            createPrLink: utils.format(BITBUCKET_CREATE_PR_LINK, project, repo)
        }
    }
}

var _getGithubInfo = function(line) {
    var GITHUB_HTTP_URL_PATTERN = /url = https:\/\/github\.com\/(.*)\/(.*)\.git/
    var GITHUB_GIT_URL_PATTERN = /url = git@github\.com:(.*)\/(.*)\.git/
    var GITHUB_REPO_LINK = "https://github.com/%s/%s"
    var GITHUB_REPO_PRS_LINK = "https://github.com/%s/%s/pulls"
    var GITHUB_CREATE_PR_LINK = "https://github.com/%s/%s/compare"

    var result = line.match(GITHUB_HTTP_URL_PATTERN);
    if (!result) {
        result = line.match(GITHUB_GIT_URL_PATTERN);
    }

    if (result) {
        return {
            server: "github",
            link: utils.format(GITHUB_REPO_LINK, result[1], result[2]),
            prsLink: utils.format(GITHUB_REPO_PRS_LINK, result[1], result[2]),
            createPrLink: utils.format(GITHUB_CREATE_PR_LINK, result[1], result[2])
        }
    }
}

var _getStashInfo = function(line, stashServer) {

    var STASH_SSH_URL_PATTERN = new RegExp("url = ssh:\\/\\/git@" + _quote(stashServer) + ":[\\d]*\\/(.*)\\/(.*)\\.git");
    var STASH_HTTP_URL_PATTERN = new RegExp("url = https:\\/\\/(.*)@" + _quote(stashServer) + "\\/scm\\/(.*)/(.*).git");
    var STASH_REPO_LINK = "https://" + stashServer + "/projects/%s/repos/%s/browse"
    var STASH_REPO_PRS_LINK = "https://" + stashServer + "/projects/%s/repos/%s/pull-requests"
    var STASH_CREATE_PR_LINK = "https://" + stashServer + "/projects/%s/repos/%s/pull-requests?create&sourceBranch="

    var project, repo;

    var result = line.match(STASH_SSH_URL_PATTERN);
    if (result) {
        project = result[1];
        repo = result[2];

    } else {
        result = line.match(STASH_HTTP_URL_PATTERN);

        if (result) {
            project = result[2];
            repo = result[3];
        }
    }

    if (project && repo) {
        return {
            server: "stash",
            link: utils.format(STASH_REPO_LINK, project, repo),
            prsLink: utils.format(STASH_REPO_PRS_LINK, project, repo),
            createPrLink: utils.format(STASH_CREATE_PR_LINK, project, repo)
        }
    }
}

function _quote(str) {
    return str.replace(/(?=[\/\\^$*+?.()|{}[\]])/g, "\\");
}

/**
 * Exports
 */
module.exports = {
    gitInfo: gitInfo,
    gitBranch: gitBranch,
    // for testing
    test: {
        _getBitButketInfo: _getBitButketInfo,
        _getGithubInfo: _getGithubInfo,
        _getStashInfo: _getStashInfo
    }
}
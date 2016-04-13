#!/usr/bin/env node

var exec = require('child_process').exec;
var fs = require('fs');
var utils = require('util');
var _ = require('underscore');

/**
 * Return current repo information
 */
var gitInfo = function(path, callback) {
    fs.readFile(path + '/.git/config', 'utf8', function(err, data) {
        if (err && err.code == 'ENOENT') {
            callback(undefined);
        } else {
            callback(_parseGitConfig(data));
        }
    });
}

var gitBranch = function(callback) {
    exec('git rev-parse --abbrev-ref HEAD', function(error, stdout, stderr) {
        callback(stdout.trim());
    });
}

// start of private methods

var _gitConfigFoundCallback = function(data, callback) {

    var repo = _parseGitConfig(data);

    /*if (repo) {
        gitBranch(function(branch) {
            repo.branch = branch;

            // update source branch for create pr link
            if (repo.server === 'stash' || repo.server === 'bitbucket') {
                repo.createPrLink = repo.createPrLink + repo.branch;
            }

            callback(repo);
        });
    } else {
        console.log('No repo link found!');
    }*/
}

var _parseGitConfig = function(data) {
    var gitConfig;

    var lines = data.split('\n');

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.indexOf('url') === 1) {
            gitConfig = _getBitButketInfo(line);
            if (gitConfig) {
                break;
            }

            gitConfig = _getStashInfo(line);
            if (gitConfig) {
                break;
            }

            gitConfig = _getGithubInfo(line);
        }
    };

    return gitConfig;
}

var _getBitButketInfo = function(line) {
    var BITBUCKET_URL_PATTERN = /url = git@bitbucket\.org:(.*)\/(.*)\.git/
    var BITBUCKET_REPO_LINK = 'https://bitbucket.org/%s/%s'
    var BITBUCKET_REPO_PRS_LINK = 'https://bitbucket.org/%s/%s/pull-requests'
    var BITBUCKET_CREATE_PR_LINK = 'https://bitbucket.org/%s/%s/pull-request/new'

    var result = line.match(BITBUCKET_URL_PATTERN);
    if (result) {
        return {
            server: 'bitbucket',
            link: utils.format(BITBUCKET_REPO_LINK, result[1], result[2]),
            prsLink: utils.format(BITBUCKET_REPO_PRS_LINK, result[1], result[2]),
            createPrLink: utils.format(BITBUCKET_CREATE_PR_LINK, result[1], result[2])
        }
    }
}

var _getStashInfo = function(line) {
    var STASH_URL_PATTERN = /url = ssh:\/\/git@stash\.atlassian\.com:[\d]*\/(.*)\/(.*)\.git/
    var STASH_REPO_LINK = 'https://stash.atlassian.com/projects/%s/repos/%s/browse'
    var STASH_REPO_PRS_LINK = 'https://stash.atlassian.com/projects/%s/repos/%s/pull-requests'
    var STASH_CREATE_PR_LINK = 'https://stash.atlassian.com/projects/%s/repos/%s/pull-requests'

    var result = line.match(STASH_URL_PATTERN);
    if (result) {
        return {
            server: 'stash',
            link: utils.format(STASH_REPO_LINK, result[1], result[2]),
            prsLink: utils.format(STASH_REPO_PRS_LINK, result[1], result[2]),
            createPrLink: utils.format(STASH_CREATE_PR_LINK, result[1], result[2])
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

/**
 * Exports
 */
module.exports = {
    gitInfo: gitInfo,
    gitBranch: gitBranch
}
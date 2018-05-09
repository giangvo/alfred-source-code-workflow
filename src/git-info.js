'use strict';

const exec = require('child_process').exec;
const utils = require('util');

/**
 * path
 * callback(error, gitInfo)
 * stashServer
 */
const gitInfo = async function (path, stashServer) {
  const url = await _getGitUrl(path);
  const branch = await _gitBranch();

  const info = _parseGitUrl(url, branch, stashServer);
  if (!info) {
    throw new Error('Fail to detect git info');
  }

  // get git root path
  info.gitRootPath = await _gitRootPath();

  return info;
};

async function _getGitUrl (path) {
  const command = 'cd ' + path + ' && git config --get remote.origin.url';
  return await _exec(command);
}

async function _gitBranch () {
  return await _exec('git rev-parse --abbrev-ref HEAD');
}

async function _gitRootPath () {
  return await _exec('git rev-parse --show-toplevel');
}

function _exec(command) {
  return new Promise((resolve, reject) => {
    exec(command, function (error, stdout) {
      if (error || !stdout) {
        reject(`${command}: not a git repo`);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

// start of private methods
function _parseGitUrl (url, branch, stashServer) {
  let gitConfig = _getBitButketInfo(url, branch);

  if (!gitConfig) {
    gitConfig = _getGithubInfo(url, branch);

    if (!gitConfig && stashServer) {
      gitConfig = _getStashInfo(url, branch, stashServer);
    }
  }

  return gitConfig;
}

function _getBitButketInfo (url, branch) {
  const BITBUCKET_SSH_URL_PATTERN = /git@bitbucket\.org:(.*)\/(.*)\.git/;
  const BITBUCKET_HTTP_URL_PATTERN = /https:\/\/(.*)@bitbucket\.org\/(.*)\/(.*).git/;

  const BITBUCKET_REPO_LINK = 'https://bitbucket.org/%s/%s';
  const BITBUCKET_REPO_PRS_LINK = 'https://bitbucket.org/%s/%s/pull-requests';
  const BITBUCKET_BRANCH_PR_LINK = 'https://bitbucket.org/%s/%s/pull-requests?query=%s';
  const BITBUCKET_CREATE_PR_LINK = 'https://bitbucket.org/%s/%s/pull-requests/new?source=%s';

  let project, repo;

  let result = url.match(BITBUCKET_SSH_URL_PATTERN);
  if (result) {
    project = result[1];
    repo = result[2];

  } else {
    result = url.match(BITBUCKET_HTTP_URL_PATTERN);

    if (result) {
      project = result[2];
      repo = result[3];
    }
  }

  if (project && repo) {
    return {
      server: 'bitbucket',
      repo: repo,
      project: project,
      branch: branch,
      url: url,

      link: utils.format(BITBUCKET_REPO_LINK, project, repo),
      prsLink: utils.format(BITBUCKET_REPO_PRS_LINK, project, repo),
      prLink: utils.format(BITBUCKET_BRANCH_PR_LINK, project, repo, branch),
      createPrLink: utils.format(BITBUCKET_CREATE_PR_LINK, project, repo, branch)
    }
  }
}

function _getGithubInfo (url, branch) {
  const GITHUB_HTTP_URL_PATTERN = /https:\/\/github\.com\/(.*)\/(.*)\.git/;
  const GITHUB_GIT_URL_PATTERN = /git@github\.com:(.*)\/(.*)\.git/;

  const GITHUB_REPO_LINK = 'https://github.com/%s/%s';
  const GITHUB_REPO_PRS_LINK = 'https://github.com/%s/%s/pulls';
  const GITHUB_BRANCH_PR_LINK = 'https://github.com/%s/%s/pulls?q=';
  const GITHUB_CREATE_PR_LINK = 'https://github.com/%s/%s/compare/%s...master';

  let project, repo;

  let result = url.match(GITHUB_HTTP_URL_PATTERN);
  if (!result) {
    result = url.match(GITHUB_GIT_URL_PATTERN);
  }

  if (result) {
    project = result[1];
    repo = result[2];
    return {
      server: 'github',
      repo: repo,
      project: project,
      branch: branch,
      url: url,

      link: utils.format(GITHUB_REPO_LINK, project, repo),
      prsLink: utils.format(GITHUB_REPO_PRS_LINK, project, repo),
      prLink: utils.format(GITHUB_BRANCH_PR_LINK, project, repo),
      createPrLink: utils.format(GITHUB_CREATE_PR_LINK, project, repo, branch)
    }
  }
}

function _getStashInfo (url, branch, stashServer) {

  const STASH_SSH_URL_PATTERN = new RegExp("ssh:\\/\\/git@" + _quote(stashServer) + ":[\\d]*\\/(.*)\\/(.*)\\.git");
  const STASH_HTTP_URL_PATTERN = new RegExp("https:\\/\\/(.*)@" + _quote(stashServer) + "\\/scm\\/(.*)/(.*).git");

  const STASH_REPO_LINK = 'https://' + stashServer + '/projects/%s/repos/%s/browse';
  const STASH_REPO_PRS_LINK = 'https://' + stashServer + '/projects/%s/repos/%s/pull-requests';
  const STASH_CREATE_PR_LINK = 'https://' + stashServer + '/projects/%s/repos/%s/pull-requests?create&sourceBranch=%s';

  let project, repo;

  let result = url.match(STASH_SSH_URL_PATTERN);
  if (result) {
    project = result[1];
    repo = result[2];

  } else {
    result = url.match(STASH_HTTP_URL_PATTERN);

    if (result) {
      project = result[2];
      repo = result[3];
    }
  }

  if (project && repo) {
    return {
      server: 'stash',
      repo: repo,
      project: project,
      branch: branch,
      url: url,

      link: utils.format(STASH_REPO_LINK, project, repo),
      prsLink: utils.format(STASH_REPO_PRS_LINK, project, repo),
      prLink: utils.format(STASH_REPO_PRS_LINK, project, repo),
      createPrLink: utils.format(STASH_CREATE_PR_LINK, project, repo, branch)
    }
  }
}

function _quote (str) {
  return str.replace(/(?=[/\\^$*+?.()|{}[\]])/g, "\\");
}

/**
 * Exports
 */
module.exports = {
  gitInfo: gitInfo
};

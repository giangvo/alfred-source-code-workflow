## Fearures
- List all projects in pre-defined source folders
- For each project, there are set of actions
    + Open in Finder
    + Open in Sublime text 2
    + Open in Iterm
    + Open Itellij IDEA
    + Open in SourceTree
    + Open project's repo link
    + Open project's pull requests link
    + Open project's create pullrequest link
- Detect project types
    + Java
    + Nodejs
    + to be updated...
- Detect project git info to get repo links
    + Github
    + Bitbutket
    + Stash

## Installation
- Download worfklow in `wf` folder of this repo
- Import workflow
- Open workflow folder in terminal and run `npm install` to install node modules

## Usage
### Commands
- `sc`: Search projects
- `scconfig`: Open config file to set source code folders

### Configs
- source-containers: All sub folders (1 level) in container are loaded at project
- sources: individual project
- stash-server: Stash server domain. e.g: stash.your-compapy.com
(Optional, config it if you want to detect stash project)

### Project actions
When selecting a project by pressing `tab` or `enter` => a list of project actions will be loaded. List of actions will be different base on project type and git info.

## Troubles shooting:
- `Open in IDEA` not work: open workflow dir in terminal and run `chmod +7 idea` (set run permission for idea script)
- `Open in Sublime` not work: Check if "/usr/local/bin/subl" is existed. 
If not, run `ln -s /Applications/Sublime\ Text\ 2.app/Contents/SharedSupport/bin/subl /usr/local/bin/subl` to create `subl` command

## Know issues
- Error with paths start with `~`
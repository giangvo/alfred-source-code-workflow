## Fearures
- List all projects in pre-defined source folders
- For each project, there are set of actions
    + Open in Finder
    + Open in Sublime text 2
    + Open in Iterm
    + Open in Iterm (Current session)
    + Open in Iterm (New split panel)
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
~~1. Download latest node version > 6.x. (https://nodejs.org/dist/v6.2.2/)~~
~~2. Download worfklow in `wf` folder of this repo~~ 
~~3. Import workflow~~

### Clone and prepare
1. Clone this repo.
2. Open workflow folder in terminal and run `npm install` to install node modules
3. Make sure there is a config file - `config.js` in root folder of workflow. If it is not existed, please clone the file `config.sample.js` and rename it to `config.js`

### Link source code to Alfred workflow folder. (If you find a better way, please suggest us. Thanks)
1. Open Alfred Preferences --> Workflows tab --> New blank workflow --> Right click to the new created workflow --> Open in Finder.
2. Copy all files (include generated `node_modules` folder) to the your new created workflow folder. Aternatively, you can create a sympolic link from source code folder to actual workflow folder. 


## Usage
### Commands
- `sc`: Search projects
- `scconfig`: Open config file to set source code folders

### Configs
- `source-containers`: All sub folders (1 level) in container are loaded at project
- `sources`: individual project
- `stash-server`: Stash server domain. e.g: stash.your-compapy.com
(Optional, config it if you want to detect stash project)

### Project actions
When selecting a project by pressing `tab` or `enter` => a list of project actions will be loaded. List of actions will be different base on project type and git info.

## Troubles shooting:
- `Open in IDEA` does not work: open workflow dir in terminal and run `chmod +7 idea` (set run permission for idea script)
- `Open in Sublime` does not work: Check if "/usr/local/bin/subl" is existed.
If not, run `ln -s /Applications/Sublime\ Text\ 2.app/Contents/SharedSupport/bin/subl /usr/local/bin/subl` to create `subl` command

## Know issues
- Error with paths start with `~`

- Installation:
+ Import workflow
+ Open workflow folder in terminal and run `npm install` to install node modules

- Usage
+ `scconfig` command: Open config file to set source code folders
source-containers: All sub folders (1 level) in container are loaded at project
sources: individual project

+ `sc` command: Load all projects

+ When selecting a project by pressing `tab` or `enter` => a list of project actions will be loaded


- Troubles shooting:
+ Open in Sublime not work: Check if "/usr/local/bin/subl" is existed. If not run 
"ln -s /Applications/Sublime\ Text\ 2.app/Contents/SharedSupport/bin/subl /usr/local/bin/subl" to create `subl` command
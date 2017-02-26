const _ = require('lodash');
const { Item } = require('alfred-workflow-nodejs-next');

const Executor = require('./Executor');
const DEFAULT_ICON = 'code.png';

class ProjectAction extends Executor {
    constructor(options) {
        super(options);

        this.shortcut = options.shortcut || '';
        this.icon = options.icon || DEFAULT_ICON;
    }

    shouldDisplay(data) {
        return true;
    }

    build(data) {
        if (this.shouldDisplay(data)) {
            const item = new Item({
                uid: this.name,
                title: this.name,
                subtitle: data.path,
                icon: 'icons/' + this.icon,
                hasSubItems: false,
                valid: true,

                // arg will be passed to hanlder of `commands.EXECUTE`
                arg: JSON.stringify({
                    actionName: this.name,
                    actionKey: this.key,
                    path: data.path
                })
            });

            return item;
        }
    };

    filterKey() {
        return this.name + (this.shortcut ? ' ' + this.shortcut : '');
    }
}

module.exports = ProjectAction;

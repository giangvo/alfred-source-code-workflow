const _ = require('underscore');

const Action = require('./action');
const AlfredNode = require('alfred-workflow-nodejs');
const Item = AlfredNode.Item;

class ProjectAction extends Action {
    constructor(options) {
        super(options);

        this.shortcut = options.shortcut || '';
        this.icon = options.icon;
    }

    shouldDisplay(data) {
        return true;
    }

    build(data, callback) {
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

    execute(arg) {
        var data = JSON.parse(arg);

        if (data.action === this.actionName) {
            this.executor(data);
        }
    };

    getSubTitle(data) {
        return data.path;
    }

    getIcon() {
        return 'icons/' + this.icon;
    }

    filterKey() {
        return this.actionName + (this.shortcut ? ' ' + this.shortcut : '');
    }

}

module.exports = ProjectAction;

class Action {
    constructor(options) {
        this.actionName = options.actionName;
        this.executor = options.executor;
    }

    execute(arg) {
        this.executor(arg);
    };
}

module.exports = Action;

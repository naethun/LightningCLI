const EventEmitter = require("./emitter")

class ModuleRunner {
    static init() {
        global.loadedModules = [];

        EventEmitter.init();
    }

    static async instantiate(type, data, tasks, total, good, bad) {
        let loadedModule = await import("../" + type);
        loadedModule = new loadedModule.default(data, tasks, total, good, bad);
        global.loadedModules.push(loadedModule);
        return loadedModule;
    }
}

module.exports = ModuleRunner
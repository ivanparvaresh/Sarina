var sarinamodule = require("./module");
var sarinaApp = require("./app");

class Sarina {

    /**
     * @return array of all modules
     */
    get modules() {
        return this._modules;
    }


    /**
     * Create a instance of Sarina
     */
    constructor() {
        this._modules = [];
    }

    /**
     * Create a module
     * 
     * @param name - name of module
     * @param deps - array of dependencies name, if dont pass dependencies array, it will search for existing modules and return the module with the passing name
     */
    module(name, deps) {
        if (deps == null) {
            for (var i = 0; i < this._modules.length; i++) {
                if (this.modules[i].name == name) {
                    return this.modules[i];
                }
            }
            throw new Error("Module '" + name + "' not found.");
        } else {
            var module = new sarinamodule(this, name, deps);
            this.modules.push(module);
            return module;
        }
    }


    /**
     * Bootstrap a module and start it
     * @param  {string or module instance} moduleOrModuleName - the module name or module instance we need to start
     */
    boot(moduleOrModuleName) {

        if (moduleOrModuleName == null)
            throw new Error("module or name is required");

        var module = null;
        if (typeof (moduleOrModuleName) == 'String') {
            module = this.module(moduleOrModuleName);
        } else {
            module = moduleOrModuleName;
        }

        var requiredModules = [];

        return new sarinaApp(this, module.name).start();
    }
}

/**
 * Sarina is a singleton module
 */
module.exports = new Sarina();
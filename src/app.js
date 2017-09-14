class App {

    /**
     * Create instance of application
     * 
     * @param  {array of providers} providers the list of providers
     */
    constructor(sarina, moduleName) {
        this._sarina = sarina;
        this._providers = [];
        this._modules = [];
        this._moduleName = moduleName;
    }

    /**
     * Start Application
     * @returns instance of promise
     */
    start() {
        var me = this;
        return new Promise(function (resolve, reject) {

            // activating modules
            me._resolveModule(me._moduleName);
            me._activateModules();


            // Start Confiugration
            for (var i = 0; i < me._providers.length; i++) {
                var prov = me._providers[i];
                if (prov.config) {
                    me._call(prov.deps, prov.config);
                }
            }

            // Start Confiugration
            for (var i = 0; i < me._providers.length; i++) {
                var prov = me._providers[i];
                if (prov.run) {
                    me._call(prov.deps, prov.run);
                }
            }

            resolve(true);
        });
    }

    _resolveModule(name) {
        var module = this._sarina.module(name);
        if (module == null)
            throw new Error("Module '" + name + "' not found.");

        // check if module already resolved or not
        // this block will handle cycle dependency loop lock too
        if (this._moduleExists(name)) {
            return;
        }

        this._modules.push(module);

        // resolve dependencies
        for (var i = 0; i < module.dependencies.length; i++) {
            var dep = module.dependencies[i];
            this._resolveModule(dep);
        }
    }
    _moduleExists(name) {
        for (var i = 0; i < this._modules.length; i++) {
            if (this._modules[i].name == name) {
                return true;
            }
        }
        return false;
    }
    _activateModules() {
        for (var i = 0; i < this._modules.length; i++) {
            this._activateModule(this._modules[i]);
        }
    }
    _activateModule(module) {
        for (var i = 0; i < module._providers.length; i++) {
            var provider = module._providers[i];
            var providerInstance = provider();
            this._providers.push(providerInstance);
        }
    }

    _call(deps, func) {
        var resolveDependencies = this._resolve(deps);
        return func.apply(this, resolveDependencies);
    }

    _resolve(deps) {
        var resolved = [];
        for (var i = 0; i < deps.length; i++) {
            resolved.push(this._resolveByName(deps[i]));
        }
        return resolved;
    }
    _resolveByName(name) {
        for (var i = 0; i < this._providers.length; i++) {
            if (this._providers[i].name == name) {

                var provider = this._providers[i];
                var deps = this._resolve(provider.deps);

                if (provider.get) {
                    return provider.get.apply(this, deps);
                }
            }
        }
        throw new Error("Provider of '" + name + "' not found");
    }
}

module.exports = App;
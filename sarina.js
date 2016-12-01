var fs = require("fs");
var ph = require("path");
var mrg = require("merge");
var winston = require('winston');

class Sarina {

    get options() {
        return this._options;
    }
    get modules() {
        return this._modules;
    }

    constructor(options) {
        this._options = options;
        this._modules = [];
        this._serviceProviders = [];
    }

    //////////////////////////////////
    /// Modular
    //////////////////////////////////
    module(func) {
        if (typeof func === 'function') {
            this.modules.push(func);
        }
    }
    loadModules(path) {
        if (fs.statSync(path).isDirectory()) {
            var files = fs.readdirSync(path);
            for (var f in files) {
                var modulePath = path + '/' + files[f];
                this.loadModules(modulePath);
            }
        } else {
            path = ph.resolve(path);
            this.module(require(path));
        }
    }


    //////////////////////////////////
    /// IOC
    //////////////////////////////////
    factory() {
        this._register("factory", arguments);
    }
    service() {
        this._register("service", arguments);
    }
    config() {
        this._register("config", arguments);
    }
    exec() {
        this._register("executable", arguments);
    }
    _register(type, args) {


        var deps = [];
        var func = null;
        var name = args[0];
        if (typeof args[1] === 'function') {
            func = args[1];
        }
        if (typeof args[1] === 'object' && Array.isArray(args[1])) {
            deps = args[1];
            func = args[2];
        }

        if (func == null)
            throw Error("activator function is not defined");

        var me;
        this._serviceProviders[name] = {
            name: name,
            dependencies: deps,
            instance: null,
            type: type,
            activator: func
        };

    }


    resolve() {
        var args = arguments;
        var result = [];

        for (var i = 0; i < args.length; i++) {
            var arg = args[i];

            if (typeof arg === 'string') {
                result.push(this._resolveByName(arg));
            }
            if (typeof arg === 'object' && Array.isArray(arg)) {

                for (var j = 0; j < arg.length; j++) {
                    result.push(this._resolveByName(arg[j]));
                }
            }
        }

        if (result.length == 1)
            return result[0];
        else
            return result;
    }
    _resolveByName(serviceName, targetService) {
        if (targetService == null) targetService = serviceName;
        var provider = this._serviceProviders[serviceName];
        if (provider == null)
            throw Error("Service '" + serviceName + "' not found");


        if (provider.type == "factory" && provider.instance != null)
            return provider.instance;

        var deps = provider.dependencies;
        var resolvedDeps = [];
        for (var i = 0; i < deps.length; i++) {

            var dep = deps[i];
            if (targetService == dep) {
                throw Error("Cycle dpendency not supported for '" + serviceName + "'");
            }
            resolvedDeps.push(this._resolveByName(dep, targetService));
        }

        provider.instance =
            provider.activator.apply(provider.activator, resolvedDeps);
        return provider.instance;
    }


    //////////////////////////////////
    /// APP
    //////////////////////////////////
    start() {
        this._loadCoreServices();
        this._initModules();
        this._executeConfigs();
        this._executeServices();
    }
    shutdown() {

    }
    _loadCoreServices() {
        var me = this;
        this.factory("options", function () {
            return me.options;
        });
        this.factory("sarina", function () {
            return me;
        });
    }
    _initModules() {
        for (var i = 0; i < this.modules.length; i++) {
            this.modules[i](this);
        }
    }
    _executeConfigs() {
        for (var providerName in this._serviceProviders) {
            var provider = this._serviceProviders[providerName];
            if (provider.type == "config") {
                this.resolve(provider.name);
            }
        }
    }
    _executeServices() {
        var runningServicesCount = 0;
        for (var providerName in this._serviceProviders) {
            var provider = this._serviceProviders[providerName];
            if (provider.type == "executable") {
                var instance = this.resolve(provider.name);
                var promise = new Promise(function (resolve, reject) {
                    instance.run(resolve, reject);
                }).then(function () {
                    runningServicesCount++;
                });
            }
        }
    }



    //////////////////////////////////
    /// Extenssions
    //////////////////////////////////
    _merge(op1, op2) {
        return mrg.recursive(true, op1, op2);
    }
}

module.exports = {
    create: function (options) {
        return new Sarina(options);
    },
    info: {
        "version": "1.0.0",
    }
}

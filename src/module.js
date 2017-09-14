/**
 * @class definitions of a Module
 */
class Module {

    /**
     * @returns string of module name
     */
    get name() {
        return this._name;
    }
    /**
     * @returns array of string which presnets dependencies name
     */
    get dependencies() {
        return this._dependencies;
    }


    /**
     * @returns Array of providers
     */
    get providers() {
        return this._providers;
    }


    /**
     * Create instance of Module 
     * 
     * @param {Sarina} sarina - instanfe of sarina
     * @param {string} name - the name of module
     * @param {array<string>} dependencies - the array of dependencies
     */
    constructor(sarina, name, dependencies) {
        this._name = name;
        this._dependencies = dependencies;
        this._providers = [];
        this._sarina = sarina;
    }

    /**
     * Create a service
     * @param  {string} name
     * @param  {Function|Array<string|Function>} funcOrArray
     * @returns Module
     */
    service(name, funcOrArray) {

        var data = this._resolveArg(funcOrArray);
        this._providers.push(function () {
            return {
                name: name,
                deps: data.deps,
                get: data.func,
            }
        });

        return this;
    }

    /**
     * Create factory
     * @param  {string} name
     * @param  {Function|Array<string|Function>} funcOrArray
     * @returns Module
     */
    factory(name, funcOrArray) {

        var data = this._resolveArg(funcOrArray);
        this._providers.push(function () {
            return {
                name: name,
                deps: data.deps,
                instance: null,
                get: function () {
                    if (this.instance == null) {
                        this.instance = data.func.apply(this, arguments);
                    }
                    return this.instance;
                },
            }
        });
        return this;
    }
    /**
     * Create configurer 
     * @param  {Function|Array<string|Function>} funcOrArray
     * @returns Module
     */
    config(funcOrArray) {

        var data = this._resolveArg(funcOrArray);
        this._providers.push(function () {
            return {
                deps: data.deps,
                config: data.func
            }
        });

        return this;
    }
    /**
     * Create an executable method
     * @param  {Function|Array<string|Function>} funcOrArray
     * @returns Module
     */
    run(funcOrArray) {
        var data = this._resolveArg(funcOrArray);
        this._providers.push(function () {
            return {
                deps: data.deps,
                run: data.func
            }
        });

        return this;
    }



    _resolveArg(arg) {

        var deps = [];
        var func = null;

        if (arg instanceof Function) {
            func = arg;
        } else {
            if (arg.length == 0) {
                throw new Error("Empty array as service provided");
            }

            func = arg[arg.length - 1];
            deps = arg.slice(0, arg.length - 1);
        }

        return {
            func: func,
            deps: deps
        };
    }
}

module.exports = Module;
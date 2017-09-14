var chai = require("chai");
var sarina = require("./../src/sarina");

var assert = chai.assert;

describe('Sarina', function () {


    describe('Sarina main functionallity', function () {

        it('#simple', function (done) {

            try {
                var app = sarina.module("simpleTestApp", []);
                sarina.boot(app)
                    .then(function () {
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    })

            } catch (err) {
                done(err);
            }

        });

        it('#service', function (done) {

            try {
                var service1Value = "";
                var service2Value = "";
                var serviceDefaultValue = "";

                var app = sarina.module("serviceTestApp", []);

                app.service("simpleService", function () {
                    var _value = "default";
                    return {
                        set: function (value) {
                            _value = value;
                        },
                        get: function () {
                            return _value;
                        }
                    }
                });



                app.run(["simpleService", function (simpleSrv) {
                    simpleSrv.set("hello");
                    service1Value = simpleSrv.get();
                }]);
                app.run(["simpleService", function (simpleSrv) {
                    simpleSrv.set("world");
                    service2Value = simpleSrv.get();
                }]);
                app.run(["simpleService", function (simpleSrv) {
                    serviceDefaultValue = simpleSrv.get();
                }]);

                sarina.boot(app)
                    .then(function () {
                        assert.equal(service1Value, "hello", "service1Value should equal 'hello' but it is '" + service1Value + "'")
                        assert.equal(service2Value, "world", "service2Value should equal 'world' but it is '" + service2Value + "'")
                        assert.equal(serviceDefaultValue, "default", "serviceDefaultValue should equal 'default' but it is '" + serviceDefaultValue + "'")
                        done();
                    }).catch(function (err) {
                        throw err;
                    })

            } catch (err) {
                throw err;
            }

        });
        it('#factory', function (done) {

            try {
                var data = "";

                var app = sarina.module("factoryTestApp", []);

                app.factory("simpleFactory", function () {
                    var _value = "";
                    return {
                        set: function (value) {
                            _value = value;
                        },
                        get: function () {
                            return _value;
                        }
                    }
                });



                app.run(["simpleFactory", function (simpleFac) {
                    simpleFac.set("hello");
                }]);
                app.run(["simpleFactory", function (simpleFac) {
                    data = simpleFac.get();
                }]);

                sarina.boot(app)
                    .then(function () {
                        assert.equal(data, "hello", "data should equal 'hello' but it is '" + data + "'")
                        done();
                    }).catch(function (err) {
                        throw err;
                    })

            } catch (err) {
                throw err;
            }

        });

        it('#dependency', function (done) {

            try {
                var data = [];

                var appRoot = sarina.module("simpleServiceAppRoot", ["dependencyTestApp1"]);
                appRoot.service("simpleServiceAppRoot", function () {
                    return "appRoot";
                });
                appRoot.run(["simpleServiceAppRoot", "simpleServiceApp1", "simpleServiceApp2", function (srvAppRoot, srvApp1, srvApp2) {
                    data["rootapp"] = [srvAppRoot, srvApp1, srvApp2];
                }]);

                var app1 = sarina.module("dependencyTestApp1", ["dependencyTestApp2"]);
                app1.service("simpleServiceApp1", function () {
                    return "app1";
                });
                app1.run(["simpleServiceApp1", "simpleServiceApp2", function (srvApp1, srvApp2) {
                    data["app1"] = [srvApp1, srvApp2];
                }]);

                var app2 = sarina.module("dependencyTestApp2", []);
                app2.service("simpleServiceApp2", function () {
                    return "app2";
                });
                app2.run(["simpleServiceApp2", function (srvApp2) {
                    data["app2"] = srvApp2;
                }]);

                sarina.boot(appRoot)
                    .then(function () {
                        assert.equal(data["rootapp"][0], "appRoot");
                        assert.equal(data["rootapp"][1], "app1");
                        assert.equal(data["rootapp"][2], "app2");

                        assert.equal(data["app1"][0], "app1");
                        assert.equal(data["app1"][1], "app2");

                        assert.equal(data["app2"], "app2");

                        done();
                    }).catch(function (err) {
                        throw err;
                    })

            } catch (err) {
                throw err;
            }

        });

    });
});
# Sarina

Sarina is a powerfull application framework for creating Web and Service oriented applications. 
Sarina created by [JavadParvaresh](https://github.com/javadparvaresh).

## Table of contents
- [Quick Start](#quick-start)
- [Bugs and feature requests](#bugs-and-feature-requests)
- [Documentation](#documentation)

## Quick start

Several quick start options are available:
- Clone the repo: `git clone https://github.com/javadparvaresh/Sarina.git`
- Install with [npm](https://www.npmjs.com): `npm install sarina`

Read the [Getting started page](/doc/quickstart.md) for information on the framework contents, templates and examples, and more.

## Bugs and feature requests

Have a bug or a feature request? [please open a new issue](https://github.com/javadparvaresh/sarina.data/issues/new).

## Documentation

Sarina's documentation, included in this repo in the root directory.

## The Basics
```javascript

var sarina=require("sarina");

// create a sarina app by passing configuration
var app=sarina.create({});
// add a executable process to sarina
app.exec("runner",function(){
    return {
        run:function(){
            return new Promise(function(resolve,reject){
                console.log("hello wolrd");
                resolve(true);
            })
        }
    }
});

// finally we need to start app
app.start();

``` 

## Add a Service
```javascript


var sarina = require("sarina");

// create a sarina app by passing configuration
var app = sarina.create({});

// add my custom service
app.service("myService", function () {
    return { name: "test" };
});


// add a executable process by injective myservice 
app.exec("runner", ["myService"], function (myService) {
    return {
        run: function () {
            return new Promise(function (resolve, reject) {
                console.log("hello " + myService.name);
                resolve(true);
            })
        }
    }
});

// finally we need to start app
app.start();

```

## Add a Factory by configuration

```javascript


var sarina = require("sarina");

// create a sarina app by passing configuration
var app = sarina.create({});

// create a event factory implementing simple observer pattern
app.factory("event",function(){

    var _subscribers={};

    return {
        subscribe:function(name,func){
            if (_subscribers[name]==null)
                _subscribers[name]=[];
            _subscribers[name].push(func);
        },
        broadcast(name,value){
            if (_subscribers[name] !=null )
                for(var i=0;i<_subscribers[name].length;i++){
                    _subscribers[name][i](value);
                }
        }
    }

})

// add my custom service
app.service("myService",["event"],function (event) {
    return {
        sum:function(a,b){
            event.broadcast("sum",a+b);
            return a+b;
        }
    }
});



app.config("app.subscribers.config",["event"],function(event){

    event.subscribe("sum",function(value){ console.log("\tresult of a+b is ",value); })

})


// add a executable process to sarina
app.exec("runner", ["myService"], function (myService) {
    return {
        run: function () {
            return new Promise(function (resolve, reject) {
                myService.sum(1,2);
                resolve(true);
            })
        }
    }
});

// finally we need to start app
app.start();

```

## Create Module and load it into app
```javascript


var sarina = require("sarina");

// create a sarina app by passing configuration
var app = sarina.create({});

// create a simple module
app.module(function(sarina){

    sarina.service("myModuleService",function(){
        return "hello";
    })
})

// You can load all modules inside a path by following script :
// app.loadModules(path);

app.exec("runner",["myModuleService"],function(myModuleService){
    return {
        run:function(){
            return new Promise(function(resolve,reject){

                console.log(myModuleService + " world");
                resolve(true);
            })
        }
    }
})

// finally we need to start app
app.start();

```
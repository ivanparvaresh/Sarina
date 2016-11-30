var assert = require('chai').assert;
var sarina=require("./../sarina.js");

describe('Sarina', function() {


    describe('Sarina main functionallity', function () {

        it('#simple', function (done) {
            
            try{
                var app=sarina.create({});
                app.start();
                done();    
            }catch(err){
                done(err);
            }
            
            	
        });
        it('#service', function (done) {
            
            try{
                var app=sarina.create({});

                app.service("simpleService",[],function(){
                    return "hello";
                });

                app.run("simpleService.run",["simpleService"],function(simpleSrv){
                    return {
                        run:function(){
                            console.log(simpleSrv);
                        }
                    }
                });

                app.start();

                done();    
            }catch(err){
                done(err);
            }
            
            	
        });

    });
});
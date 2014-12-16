"use strict";

var support = require('./support');
var pusher = require('../libs');
var app = {
    get: function () {
        return {
            appKey: "54c3d3fa713a711958620e7d",
            appSecret: "ebb37741f5d662e6dab019b4"
        }
    }
};

//var napp = {
//    model: function () {
//        return {
//            all: function () {
//                var cb = arguments[arguments.length - 1];
//                cb(null, [
//                    {
//                        platform: "ios",
//                        type: "registration",
//                        value: "031a2810731"
//                    }
//                ])
//            }
//        }
//    }


describe('Jpush', function () {


    var h, user;

    var validCredentials = {name: 'lizhaogai', email: 'lizhaogai@qq.com', password: '111111'};
    var userpusher = { platform: "ios", type: "registration", value: "031a2810731"};

    beforeEach(support.setup());
    beforeEach(support.cleanup());
    beforeEach(support.setupUsers(validCredentials, function (_user) {
        user = _user;
    }));
    beforeEach(support.loginWith(validCredentials));
    beforeEach(support.setupUserpusher(userpusher));

    beforeEach(function (done) {
        support.createHelper(function (helper) {
            h = helper;
            pusher.init(h.napp, app);
            done();
        });
    });

    afterEach(function (done) {
        h.cleanup(done);
    });

    describe('Jpush', function () {
        it('Test Broadcast', function (done) {
            h.napp.pusher.broadcast("Pusher Message BroadCast Test", done);
        });

        it('Test Notify', function (done) {
            h.napp.pusher.notify(user.id, "Pusher Message Notify One User Test", done);
        });
    });
});
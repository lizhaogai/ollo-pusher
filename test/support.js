"use strict";

require('logs').use('log4js');

var _ = require('lodash');
var async = require('async');
var chai = require('chai');
var sira = require('sira');
var veriuser = require('sira-express-veriuser');
var musher = require('musher');
var express = require('express');
var request = require('supertest');
var nino = require('nino');
var Nino = nino.Nino;
var napp;

var t = exports.t = chai.assert;
chai.config.includeStack = true;

var _notOk = t.notOk;
t.notOk = function (obj) {
    if (obj) {
        if (obj.name === 'ValidationError') {
            throw new Error('Validation Error: ' + obj.context + ' - ' + util.inspect(obj.codes));
        } else if (obj instanceof Error) {
            throw obj;
        }
    }

    return _notOk(obj);
};


t.plan = function (expected, done) {
    var actual = 0;
    return {
        ok: function () {
            if (++actual === expected) done();
        }
    }
};

function Helper(napp) {
    this.napp = napp;

}

Helper.prototype.close = function (cb) {
    var napp = this.napp;
    this.cleanup(function () {
        this.napp.close();
        cb();
    });
};

Helper.prototype.cleanup = function (cb) {
    exports.cleanup(this.napp, cb);
};

exports.createHelper = function (options, cb) {
    if (typeof options === "function") {
        cb = options;
        options = null;
    }

    var h = new Helper(napp);
    cb(h);
};


exports.nino = function (options) {
    options = _.defaults({
        db: { driver: 'redis-hq',
            database: 6}
//        ,
//        kvs: {
//            driver: 'redis',
//            database: 8
//        }
    }, options);

    var napp = nino();
    napp.module(__dirname + '/../libs');
    napp.setAll(options);
    return napp;
};

exports.setup = function () {
    return function (done) {
        var test = this;
        napp = test.nino = test.napp = exports.nino();
        test.napp.enable('auth');
//        test.nino.enable('resultful');
        test.napp.boot(function (err) {
            if (err) return done(err);
            _.forEach(test.napp.models, function (Model, name) {
                test[name] = Model;
            });
            done();
        });
    }
};

exports.setupUsers = function (data, cb) {
    return function (done) {
        this.User.create(data, function (error, user) {
            cb(user);
            done()
        });
    };
};


exports.cleanup = function (ninoOrNapp, done) {
    var napp = ninoOrNapp && (ninoOrNapp.napp || ninoOrNapp);

    if (arguments.length < 2) {
        return cleanup;
    } else {
        return cleanup(done);
    }

    function cleanup(done) {
        napp = napp || this.napp;
        async.eachSeries(_.values(napp.models), function (Model, callback) {
            Model.destroyAll(callback);
        }, done);
    }

};

exports.loginWith = function loginWith(credential) {
    return function (done) {
        var test = this;
        this.User.login(credential, function (err, token) {
            t.ok(token);
            test.token = token;
            token.user(function (err, _user) {
                t.ok(_user);
                test.user = _user;
                done();
            });
        });
    }
};

exports.setupUserpusher = function setupUserpusher(payload) {
    return function (done) {
        var test = this;
        this.napp.rekuest('userpusher.updatePushSetting')
            .prop('accessToken', test.token)
            .payload(payload)
            .send(function (err) {
                t.notOk(err);
                done();
            });
    }
};

exports.startMqttServer = function (cb) {
    require('mosca/lib/cli')(['node', 'mosca'], cb);
};

exports.defer = function (done) {
    var d = new sira.Deferred;
    d.done(done);
    return d;
};

exports.musher = function (options, cb) {
    if (typeof options === 'function') {
        cb = options;
        options = null;
    }
    options = _.defaults({host: 'localhost'}, options);
    var socket = musher.connect(options);
    if (typeof cb === 'function') {
        socket.on('connected', cb);
    }
    return socket;
};

exports.createApp = function createApp(napp) {
    var app = express();
    app.use(veriuser(napp));
    app.use(nino.verinode(napp));
    app.use(require('sira-express-rest')(napp));
    return app;
};

exports.request = function (app) {
    return _.assign(request(app), protoReqest);
};

exports.createAppAndRequest = function (napp) {
    var app = exports.createApp(napp);
    return _.assign(request(app), protoReqest);
};

var protoReqest = {
    json: function json(method, url) {
        if (url === undefined) {
            url = method;
            method = 'get';
        }

        return this[method](url)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/);
    }
};


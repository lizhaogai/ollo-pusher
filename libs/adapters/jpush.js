"use strict";

var jpush = require('jpush-sdk');
var _ = require('underscore');

module.exports = function (appKey, masterSecret, napp) {
    var client = jpush.buildClient(appKey, masterSecret);
    return new Client(client, napp);
};

function Client(client, napp) {
    var self = this;
    self.client = client;
    self.napp = napp;
}

Client.prototype.notify = function (ownerId, message, cb) {
    var self = this;
    var Userpusher = self.napp.model('Userpusher');
    Userpusher.all({where: {ownerId: ownerId}}, function (err, ups) {
        if (err) {
            return cb(err);
        }

        var registrationIds = [];
        var alias = [];

        _.forEach(ups, function (up) {
            if (up.type == "registration") {
                registrationIds.push(up.value);
            }
            if (up.type == "alias") {
                alias.push(up.value);
            }
        });

        if (registrationIds.length > 0 && alias.length > 0) {
            self.client.push().setPlatform(jpush.ALL)
                .setAudience(jpush.registration_id.call(jpush, registrationIds), jpush.alias.call(jpush, alias))
                .setNotification(message, jpush.ios(message, 'happy', 5))
                .send(function (err) {
                    if (err) {
                        return  cb(err)
                    }
                    return cb();
                });
        } else if (registrationIds.length > 0) {
            self.client.push().setPlatform(jpush.ALL)
                .setAudience(jpush.registration_id.call(jpush, registrationIds))
                .setNotification(message, jpush.ios(message, 'happy', 5))
                .send(function (err) {
                    if (err) {
                        return  cb(err)
                    }
                    return cb();
                });
        } else if (alias.length > 0) {
            self.client.push().setPlatform(jpush.ALL)
                .setAudience(jpush.alias.call(jpush, alias))
                .setNotification(message, jpush.ios(message, 'happy', 5))
                .send(function (err) {
                    if (err) {
                        return  cb(err)
                    }
                    return cb();
                });
        } else {
            return cb();
        }
    });
};

Client.prototype.broadcast = function (message, cb) {
    var self = this;
    self.client.push().setPlatform(jpush.ALL)
        .setAudience(jpush.ALL)
        .setNotification(message, jpush.ios(message, 'happy', 5))
        .send(function (err) {
            if (err) {
                return  cb(err)
            }
            return cb();
        });

};
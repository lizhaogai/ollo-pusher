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
    var UserPush = self.napp.model('UserPush');
    UserPush.all({where: {ownerId: ownerId}}, function (err, ups) {
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

        self.client.push().setPlatform(jpush.ALL)
            .setAudience(jpush.registration_id.call(jpush, registrationIds), jpush.alias.call(jpush, alias))
            .setNotification(message, jpush.ios('ios alert', 'happy', 5))
            .send(function (err) {
                if (err) {
                    return  cb(err)
                }
                return cb();
            });
    });
};

Client.prototype.broadcast = function (message, cb) {
    self.client.push().setPlatform(jpush.ALL)
        .setAudience(jpush.ALL)
        .setNotification(message, jpush.ios('ios alert', 'happy', 5))
        .send(function (err) {
            if (err) {
                return  cb(err)
            }
            return cb();
        });

};
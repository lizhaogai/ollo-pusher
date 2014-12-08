"use strict";

var _ = require('lodash');
module.exports = function (UserPush) {

    UserPush.validatesPresenceOf('ownerId', 'platform', 'type', 'value');

    UserPush.updatePushSetting = function (ownerId, data, cb) {
        if (!data.platform || !data.type || !data.value) {
            return cb({
                "name": "ValidationError",
                "status": 400,
                "message": "Validation error",
                "statusCode": 400
            });
        }

        UserPush.findOne({where: {ownerId: ownerId, paltform: data.platform, type: data.type}}, function (err, userPush) {
            if (err) return cb(err);
            data.ownerId = ownerId;
            if (!userPush) {
                UserPush.create(data, cb);
            } else {
                userPush.updateAttributes(data, cb);
            }
        });
    };

    UserPush.findPushSettings = function (ownerId, data, cb) {
        var where = {ownerId: ownerId};
        if (data) {
            if (data.platform) {
                where.platform = data.platform;
            }
            if (data.type) {
                where.type = data.type;
            }
        }
        UserPush.all({where: where}, function (err, userPushs) {
            if (err) return cb(err);
            return cb(null, userPushs);
        });
    };

    UserPush.expose('updatePushSetting', {
        accepts: [
            {arg: 'ownerId', type: 'string', source: function (ctx) {
                return ctx.req.accessToken && ctx.req.accessToken.userId;
            }},
            {arg: 'data', type: 'object', source: 'body'}
        ],
        returns: {
            arg: 'result', type: 'object', root: true
        },
        http: {verb: 'update', path: '/'}
    });

    UserPush.expose('findPushSettings', {
        accepts: [
            {arg: 'ownerId', type: 'string', source: function (ctx) {
                return ctx.req.accessToken && ctx.req.accessToken.userId;
            }},
            {arg: 'data', type: 'object', source: 'body'}
        ],
        returns: {
            arg: 'result', type: 'object', root: true
        },
        http: {verb: 'get', path: '/'}
    });

};
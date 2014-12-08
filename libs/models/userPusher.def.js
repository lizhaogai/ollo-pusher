"use strict";

var sec = require('sira-core').sec;

module.exports = function () {
    return {
        properties: {
            id: {type: String},
            ownerId: { type: String, index: true},
            platform: { type: String, index: true},
            type: { type: String, index: true},
            value: { type: String }
        },
        acls: [
            {
                principalType: sec.ROLE,
                principalId: sec.EVERYONE,
                permission: sec.DENY
            },
            {
                principalType: sec.ROLE,
                principalId: sec.AUTHENTICATED,
                permission: sec.ALLOW,
                property: "updatePushSetting"
            },
            {
                principalType: sec.ROLE,
                principalId: sec.AUTHENTICATED,
                permission: sec.ALLOW,
                property: "findPushSettings"
            }
        ]
    }
};
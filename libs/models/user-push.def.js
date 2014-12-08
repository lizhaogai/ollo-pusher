"use strict";

var sec = require('sira-core').security;

module.exports = function (t) {
    return {
        properties: {
            id: {type: String},
            ownerId: { type: String, index: true},
            platform: { type: String, index: true},
            type: { type: String, index: true},
            value: { type: String }
        }
    }
};
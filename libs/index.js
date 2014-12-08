"use strict";

exports.init = function (napp, app) {
    var opts = app.get('pusher');
    var appKey = opts.appKey;
    var appSecret = opts.appSecret;
    var adapter = opts.adapter || "jpush";

    var pushAdapter = require('./adapters/' + adapter)(appKey, appSecret, napp);
    napp.pusher = pushAdapter;
};


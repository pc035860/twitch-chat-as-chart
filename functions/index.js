const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.rechatSegment = require('./rechatSegment')(admin);
exports.rechatRun = require('./rechatRun')(admin);


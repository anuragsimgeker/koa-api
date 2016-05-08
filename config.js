'use strict';

const config = require('config-multipaas')(),
  jwt = require('koa-jwt'),
  bcrypt = require('co-bcryptjs'),
  co = require('co');

// current NODE_ENV
config.add({ ENV: process.env.NODE_ENV || 'development' });

// secret for JWT signing
config.add({ JWT_SECRET: 'shared-secret' });

// default mongodb database
config.add({ MONGODB_DB: 'testDB' });

// unit testing username
config.add({ TEST_EMAIL_ADDRESS: 'test@test.com' });

// unit testing encoded email address
config.add({ TEST_ENCODED_EMAIL_ADDRESS: new Buffer(config.get('TEST_EMAIL_ADDRESS')).toString('base64') });

// unit testing username
config.add({ TEST_PASSWORD: 'test' });

// unit testing password
co(function * () {
  var salt = yield bcrypt.genSalt(10);
  var passwordHash = yield bcrypt.hash(config.get('TEST_PASSWORD'), salt);
  config.add({ TEST_PASSWORD_HASH: passwordHash });
});

// unit testing access token
config.add({ TEST_TOKEN: jwt.sign({ username: config.get('TEST_EMAIL_ADDRESS') }, config.get('JWT_SECRET')) });

// unit testing firstName
config.add({ FIRST_NAME: 'firstName' });

// unit testing lastName
config.add({ LAST_NAME: 'lastName' });

// unit testing verification hash and encoded verification hash
co(function * () {
  var salt = yield bcrypt.genSalt(10);
  var verificationHash = yield bcrypt.hash(config.get('TEST_EMAIL_ADDRESS'), salt);
  config.add({ TEST_VERIFICATION_HASH: verificationHash });
  config.add({ TEST_ENCODED_VERIFICATION_HASH: new Buffer(verificationHash).toString('base64') });
});

module.exports = config;

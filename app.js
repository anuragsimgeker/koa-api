'use strict';

/**
 * Module dependencies.
 */
const koa = require('koa'),
  co = require('co'),
  config = require('./config'),
  logger = require('koa-logger'),
  route = require('koa-route'),
  jwt = require('koa-jwt'),
  common = require('./controllers/common'),
  users = require('./controllers/users'),
  mongoose = require('mongoose');

let app = koa();

// logger
app.use(logger());

// mongodb connection
co(function * () {
  // dont connect if test env
  if (config.get('ENV') !== 'testing') {
    yield mongoose.connect(config.get('MONGODB_DB_URL').replace(/\/$/, '') + '/' + config.get('MONGODB_DB'))
  }
});

// unprotected routes
app.use(route.head('/', common.heartbeat));
app.use(route.get('/', common.index));
app.use(route.post('/api/user/login', users.login));
app.use(route.post('/api/user/signup', users.signup));
app.use(route.get('/api/user/verify/:emailAddress/:verificationHash', users.verify));
app.use(route.get('/api/user/resendVerificationLink/:emailAddress', users.resendVerificationLink));


// Middleware below this line is only reached if JWT token is valid
app.use(jwt({ secret: config.get('JWT_SECRET') }));

// protected routes
app.use(route.get('/api/user', users.current));

// listen
app.listen(config.get('PORT'), config.get('IP'), function () {
  console.log(`Application worker ${process.pid} started at ip ${config.get('IP')} port ${config.get('PORT')}...`);
});

module.exports = app;

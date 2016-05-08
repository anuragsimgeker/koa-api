'use strict';

/**
 * Module dependencies.
 */
const jwt = require('koa-jwt'),
  parse = require('co-body'),
  bcrypt = require('co-bcryptjs'),
  config = require('config-multipaas')(),
  User = require('../models/user');

/**
 * Returns the current user for JWT access token
 */
module.exports.current = function* () {
  this.body = this.state.user;
};

/**
 * User login
 * @return {object} JWT access token
 */
module.exports.login = function* () {
  let body = yield parse(this);

  // validate
  if (!body.username) this.throw(400, 'Username required');
  if (!body.password) this.throw(400, 'Password required');

  // find user
  let user = yield User.findOne({ emailAddress: body.username }).exec();

  // user not found
  if (!user) this.throw(400, 'User not found');

  // check account verification
  if (!user.verified) this.throw(400, 'User not verified');

  // match passwords
  let match = yield bcrypt.compare(body.password, user.password);

  // invalid password
  if (!match) this.throw(400, 'Incorrect password');

  // password matched, send jwt token
  this.body = { access_token: jwt.sign({ username: user.emailAddress }, 'shared-secret') };
};

/**
 * User signup
 * @return {object} User
 */
module.exports.signup = function* () {
  let body = yield parse(this);

  // validate
  if (!body.firstName) this.throw(400, 'First name required');
  if (!body.lastName) this.throw(400, 'Last name required');
  if (!body.emailAddress) this.throw(400, 'Email address required');
  if (!body.password) this.throw(400, 'Password required');

  // find if user exists
  let existingUser = yield User.findOne({ emailAddress: body.emailAddress }).exec();

  if (existingUser.emailAddress === body.emailAddress) this.throw(400, 'Email address exists');

  //hash password
  let salt = yield bcrypt.genSalt(10);
  let passwordHash = yield bcrypt.hash(body.password, salt);

  // hash for account verification
  let verificationHash = yield bcrypt.hash(body.emailAddress + Date.now(), salt);

  const newUser = yield User.create({
    firstName: body.firstName,
    lastName: body.lastName,
    emailAddress: body.emailAddress,
    password: passwordHash,
    verified: false,
    verificationHash: verificationHash
  });

  let verificationLink = config.get('HOSTNAME') + ':' + config.get('PORT') + '/api/user/verify/' + new Buffer(newUser.emailAddress).toString('base64') + '/' + new Buffer(verificationHash).toString('base64');

  // TODO: verificationLink should be sent to the emailAddress, we just return it for development
  this.body = verificationLink;
};

/**
 * Verify user account after signup
 * @param {string} emailAddress     User email address
 * @param {string} verificationHash Generated verification hash
 */
module.exports.verify = function* (emailAddress, verificationHash) {

  // validate
  if (!emailAddress) this.throw(400, 'Missing Email address');
  if (!verificationHash) this.throw(400, 'Missing verification hash');

  // find user
  let user = yield User.findOne({ emailAddress: new Buffer(emailAddress, 'base64').toString('ascii') }).exec();

  // user not found
  if (!user) this.throw(400, 'User not found');

  // check if already verified
  if (user.verified) this.throw(400, 'User already verified');

  // found user, let's check the verificationHash
  if (user.verificationHash !== new Buffer(verificationHash, 'base64').toString('ascii')) this.throw(400, 'Wrong verificationHash');

  // valid hash, set verified to true and save it
  user.verified = true;
  yield user.save();

  this.body = 'User verified';
};

/**
 * Resend verification link
 * @param {string} emailAddress     User email address
 */
module.exports.resendVerificationLink = function* (emailAddress) {

  // validate
  if (!emailAddress) this.throw(400, 'Missing Email address');

  // find user
  let user = yield User.findOne({ emailAddress: emailAddress }).exec();

  // user not found
  if (!user) this.throw(400, 'User not found');

  // check if already verified
  if (user.verified) this.throw(400, 'User already verified');

  // regenerate hash for account verification
  let salt = yield bcrypt.genSalt(10)
  let verificationHash = yield bcrypt.hash(emailAddress + Date.now(), salt)

  // save new hash
  yield user.update({ verificationHash: verificationHash }).exec();

  let verificationLink = config.get('HOSTNAME') + ':' + config.get('PORT') + '/api/user/verify/' + new Buffer(user.emailAddress).toString('base64') + '/' + new Buffer(verificationHash).toString('base64');

  // TODO: verificationLink should be sent to the emailAddress, we just return it for development
  this.body = verificationLink;
};

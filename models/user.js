'use strict';

const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  emailAddress: { type: String, required: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verificationHash: String
}));

module.exports = User;

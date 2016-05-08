'use strict';

const mongoose = require('mongoose');

module.exports.heartbeat = function* (){
  this.body = '';
};

module.exports.index = function* () {
  this.body = 'hello world!';
};

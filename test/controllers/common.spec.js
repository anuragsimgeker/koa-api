var request = require('supertest'),
  sinon = require('sinon'),
  app, sandbox;

app = require('../../app').listen();

describe('common', function() {

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });
  afterEach(function() {
    sandbox.restore();
  });

  describe('#heartbeat HEAD /', function() {
    it('should respond with 200 and empty body', function(done) {
      request(app)
        .head('/')
        .expect(200, '', done);
    });
  });

  describe('#index GET /', function() {
    it('should respond with 200 and body', function(done) {
      request(app)
        .get('/')
        .expect(200, 'hello world!', done);
    });
  });
});

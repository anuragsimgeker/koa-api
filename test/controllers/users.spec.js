var config = require('../../config'),
  request = require('supertest'),
  sinon = require('sinon'),
  User = require('../../models/user'),
  app, sandbox, findOneStub, createStub;

app = require('../../app').listen();

describe('users', function() {

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    findOneStub = sandbox.stub(User, 'findOne');
    createStub = sandbox.stub(User, 'create');
  });
  afterEach(function() {
    sandbox.restore();
  });

  describe('#current GET /api/user', function() {
    it('should respond with 401 if no auth', function(done) {
      request(app)
        .get('/api/user')
        .expect(401, done);
    });
    it('should respond with 200 if auth is set', function(done) {
      request(app)
        .get('/api/user')
        .set('Authorization', 'Bearer ' + config.get('TEST_TOKEN'))
        .expect(200, done);
    });
  });

  describe('#login POST /api/user/login', function() {
    it('should throw 400 Username required', function(done) {
      request(app)
        .post('/api/user/login')
        .send({ password: config.get('TEST_PASSWORD') })
        .expect(400, 'Username required', done);
    });
    it('should throw 400 Password required', function(done) {
      request(app)
        .post('/api/user/login')
        .send({ username: config.get('TEST_EMAIL_ADDRESS') })
        .expect(400, 'Password required', done);
    });
    it('should throw 400 User not found', function(done) {
      findOneStub.returns({ exec: sandbox.stub().returns(function * () { return null; })});
      request(app)
        .post('/api/user/login')
        .send({ username: 'this-user-does-not-exist', password: config.get('TEST_PASSWORD') })
        .expect(400, 'User not found', done);
    });
    it('should throw 400 User not verified', function(done) {
      findOneStub.returns({
        exec: sandbox.stub().returns({
          verified: false,
          emailAddress: config.get('TEST_EMAIL_ADDRESS'),
          password: config.get('TEST_PASSWORD_HASH')
        })
      });
      request(app)
        .post('/api/user/login')
        .send({ username: config.get('TEST_EMAIL_ADDRESS'), password: config.get('TEST_PASSWORD') })
        .expect(400, 'User not verified', done);
    });
    it('should throw 400 Incorrect password', function(done) {
      findOneStub.returns({
        exec: sandbox.stub().returns({
          verified: true,
          emailAddress: config.get('TEST_EMAIL_ADDRESS'),
          password: config.get('TEST_PASSWORD_HASH')
        })
      });
      request(app)
        .post('/api/user/login')
        .send({ username: config.get('TEST_EMAIL_ADDRESS'), password: 'this-password-is-incorrect' })
        .expect(400, 'Incorrect password', done);
    });
    it('should send 200', function(done) {
      findOneStub.returns({
        exec: sandbox.stub().returns({
          verified: true,
          emailAddress: config.get('TEST_EMAIL_ADDRESS'),
          password: config.get('TEST_PASSWORD_HASH')
        })
      });
      request(app)
        .post('/api/user/login')
        .send({ username: config.get('TEST_EMAIL_ADDRESS'), password: config.get('TEST_PASSWORD') })
        .expect(200, done);
    });
  });

  describe('#signup POST /api/user/signup', function() {
    it('should throw 400 Last name required', function(done) {
      request(app)
        .post('/api/user/signup')
        .send({ lastName: config.get('LAST_NAME'), emailAddress: config.get('TEST_EMAIL_ADDRESS'), password: config.get('TEST_PASSWORD') })
        .expect(400, 'First name required', done);
    });
    it('should throw 400 Last name required', function(done) {
      request(app)
        .post('/api/user/signup')
        .send({ firstName: config.get('FIRST_NAME'), emailAddress: config.get('TEST_EMAIL_ADDRESS'), password: config.get('TEST_PASSWORD') })
        .expect(400, 'Last name required', done);
    });
    it('should throw 400 Email address required', function(done) {
      request(app)
        .post('/api/user/signup')
        .send({ firstName: config.get('FIRST_NAME'), lastName: config.get('LAST_NAME'), password: config.get('TEST_PASSWORD') })
        .expect(400, 'Email address required', done);
    });
    it('should throw 400 Password required', function(done) {
      request(app)
        .post('/api/user/signup')
        .send({ firstName: config.get('FIRST_NAME'), lastName: config.get('LAST_NAME'), emailAddress: config.get('TEST_EMAIL_ADDRESS')})
        .expect(400, 'Password required', done);
    });
    it('should throw 400 Email address exists', function(done) {
      findOneStub.returns({
        exec: sandbox.stub().returns({
          verified: true,
          emailAddress: config.get('TEST_EMAIL_ADDRESS'),
          password: config.get('TEST_PASSWORD_HASH')
        })
      });
      request(app)
        .post('/api/user/signup')
        .send({ firstName: config.get('FIRST_NAME'), lastName: config.get('LAST_NAME'), emailAddress: config.get('TEST_EMAIL_ADDRESS'), password: config.get('TEST_PASSWORD') })
        .expect(400, 'Email address exists', done);
    });
    it('should send 200', function(done) {
      findOneStub.returns({
        exec: sandbox.stub().returns({})
      });
      createStub.returns({
        emailAddress: config.get('TEST_EMAIL_ADDRESS')
      });
      request(app)
        .post('/api/user/signup')
        .send({ firstName: config.get('FIRST_NAME'), lastName: config.get('LAST_NAME'), emailAddress: config.get('TEST_EMAIL_ADDRESS'), password: config.get('TEST_PASSWORD') })
        .expect(200, done);
    });
  });

  describe('#verify GET /api/user/verify/:emailAddress/:verificationHash', function() {
    it('should throw 400 User not found', function(done) {
      findOneStub.returns({ exec: sandbox.stub().returns(function * () { return null; })});
      request(app)
        .get('/api/user/verify/' + 'this-user-does-not-exist' + '/' + new Buffer(config.get('TEST_EMAIL_ADDRESS')).toString('base64'))
        .expect(400, 'User not found', done);
    });
    it('should throw 400 User already verified', function(done) {
      findOneStub.returns({
        exec: sandbox.stub().returns({
          verified: true
        })
      });
      request(app)
        .get('/api/user/verify/' + config.get('TEST_ENCODED_EMAIL_ADDRESS') + '/' + config.get('TEST_ENCODED_VERIFICATION_HASH'))
        .expect(400, 'User already verified', done);
    });
    it('should throw 400 Wrong verificationHash', function(done) {
      findOneStub.returns({
        exec: sandbox.stub().returns({
          verified: false,
          verificationHash: config.get('TEST_VERIFICATION_HASH')
        })
      });
      request(app)
        .get('/api/user/verify/' + config.get('TEST_ENCODED_EMAIL_ADDRESS') + '/' + 'this-hash-is-incorrect')
        .expect(400, 'Wrong verificationHash', done);
    });
    it('should send 200 User verified', function(done) {
      findOneStub.returns({
        exec: sandbox.stub().returns({
          verified: false,
          verificationHash: config.get('TEST_VERIFICATION_HASH'),
          save: function (cb) {
            cb(null, sandbox.stub().returns({}));
          }
        })
      });
      request(app)
        .get('/api/user/verify/' + config.get('TEST_ENCODED_EMAIL_ADDRESS') + '/' + config.get('TEST_ENCODED_VERIFICATION_HASH'))
        .expect(200, 'User verified', done);
    });
  });

  describe('#resendVerificationLink GET /api/user/resendVerificationLink/:emailAddress', function() {

    it('should throw 400 User not found', function(done) {
      findOneStub.returns({ exec: sandbox.stub().returns(function * () { return null; })});
      request(app)
        .get('/api/user/resendVerificationLink/null')
        .expect(400, 'User not found', done);
    });
    it('should throw 400 User already verified', function(done) {
      findOneStub.returns({
        exec: sandbox.stub().returns({
          verified: true,
          emailAddress: config.get('TEST_EMAIL_ADDRESS'),
          password: config.get('TEST_PASSWORD_HASH')
        })
      });
      request(app)
        .get('/api/user/resendVerificationLink/' + config.get('TEST_EMAIL_ADDRESS'))
        .expect(400, 'User already verified', done);
    });
    it('should send 200', function(done) {
      findOneStub.returns({
        exec: sandbox.stub().returns({
          verified: false,
          emailAddress: config.get('TEST_EMAIL_ADDRESS'),
          password: config.get('TEST_PASSWORD_HASH'),
          update: function (cb) {
            cb(null, sandbox.stub().returns({ exec: sandbox.stub().returns({}) }));
          }
        })
      });
      request(app)
        .get('/api/user/resendVerificationLink/' + config.get('TEST_EMAIL_ADDRESS'))
        .expect(200, done);
    });
  });
});

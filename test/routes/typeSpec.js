const db = require('../../models');
const app = require('../../app');
const login = require('../helpers').login;
const setup = require('../seed').setup;
const teardown = require('../seed').teardown;
const request = require('supertest');
const expect = require('chai').expect;

describe('Type routes', function() {
  describe('GET /types', function() {
    let user = null;
    let type = null;
    before(function(done) {
      setup()
        .then(function() {
          return db.Type.findOne({ name: 'Company' });
        })
        .then(function(company) {
          type = company;
          return db.User.findById(company.createdBy);
        })
        .then(function(creator) {
          user = creator;
          done();
        })
        .catch(done);
    });

    it('responds with all types if token is valid', function(done) {
      const token = login(user);
      request(app)
        .get('/types')
        .set('authorization', 'Bearer: ' + token)
        .expect(200)
        .expect(function(res) {
          expect(res.body.length).to.equal(3);
          expect(res.body.map(c => c.name)).to.have.members([
            'Company',
            'Employees',
            'Brand'
          ]);
          expect(res.body.map(c => c.isAgent)).to.have.members([
            true,
            true,
            false
          ]);
        })
        .end(done);
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .get('/types')
        .expect(
          401,
          {
            message: 'You must be logged in to continue.'
          },
          done
        );
    });

    after(teardown);
  });

  describe('POST /types', function() {
    let user = null;
    before(function(done) {
      setup()
        .then(function() {
          return db.User.findOne({ firstName: 'Alice' });
        })
        .then(function(alice) {
          user = alice;
          done();
        })
        .catch(done);
    });

    it('creates a type if token is valid', function(done) {
      const token = login(user);
      request(app)
        .post('/types')
        .send({
          name: 'Logo',
          isAgent: false
        })
        .set('authorization', 'Bearer: ' + token)
        .expect(200)
        .expect(function(res) {
          expect(res.body.isAgent).to.be.false;
          expect(res.body.name).to.equal('Logo');
        })
        .end(done);
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .post('/types')
        .send({ stuff: 'here' })
        .expect(
          401,
          {
            message: 'You must be logged in to continue.'
          },
          done
        );
    });

    after(teardown);
  });

  describe('PATCH /types/:typeId', function() {
    let type = null;
    let user = null;
    let otherUser = null;
    before(function(done) {
      setup()
        .then(function() {
          return db.User.findOne({ firstName: 'Alice' });
        })
        .then(function(alice) {
          user = alice;
          return db.Type.create({
            isAgent: false,
            name: 'Corporation',
            createdBy: user.id
          });
        })
        .then(function(newType) {
          type = newType;
          return db.User.findOne({ firstName: 'Bob' });
        })
        .then(function(bob) {
          otherUser = bob;
          done();
        })
        .catch(done);
    });

    it('updates a type if token is valid', function(done) {
      const token = login(user);
      request(app)
        .patch(`/types/${type.id}`)
        .send({
          name: 'Business'
        })
        .set('authorization', 'Bearer: ' + token)
        .expect(200)
        .expect(function(res) {
          expect(res.body.name).to.equal('Business');
          expect(res.body.isAgent).to.be.false;
        })
        .end(done);
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .patch(`/types/${type.id}`)
        .send({ random: 'data' })
        .expect(
          401,
          {
            message: 'You must be logged in to continue.'
          },
          done
        );
    });

    it('it should be unauthorized if attempted by another user', function(
      done
    ) {
      const token2 = login(otherUser);
      request(app)
        .patch(`/types/${type.id}`)
        .send({ random: 'data' })
        .set('authorization', 'Bearer: ' + token2)
        .expect(
          401,
          {
            message: 'Unauthorized'
          },
          done
        );
    });

    after(teardown);
  });

  describe('DELETE /types/:typeId', function() {
    let type = null;
    let user = null;
    let otherUser = null;
    before(function(done) {
      setup()
        .then(function() {
          return db.User.find({});
        })
        .then(function(users) {
          user = users.find(u => u.firstName === 'Alice');
          otherUser = users.find(u => u.firstName === 'Bob');
          return db.Type.findOne({ name: 'Company' });
        })
        .then(function(company) {
          type = company;
          done();
        })
        .catch(done);
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .delete(`/types/${type.id}`)
        .expect(
          401,
          {
            message: 'You must be logged in to continue.'
          },
          done
        );
    });

    it('it should be unauthorized if attempted by another user', function(
      done
    ) {
      const token2 = login(otherUser);
      request(app)
        .delete(`/types/${type.id}`)
        .set('authorization', 'Bearer: ' + token2)
        .expect(
          401,
          {
            message: 'Unauthorized'
          },
          done
        );
    });

    it('deletes a type if the token is valid', function(done) {
      const token = login(user);
      request(app)
        .delete(`/types/${type.id}`)
        .set('authorization', 'Bearer: ' + token)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.equal({});
          db.Asset
            .findById(type.id)
            .then(function(result) {
              expect(result).to.be.null;
            })
            .then(function() {
              done();
            })
            .catch(done);
        });
    });

    after(teardown);
  });
});

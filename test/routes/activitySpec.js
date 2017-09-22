const db = require('../../models');
const app = require('../../app');
const login = require('../helpers').login;
const setup = require('../seed').setup;
const teardown = require('../seed').teardown;
const request = require('supertest');
const expect = require('chai').expect;

describe('Activity routes', function() {
  let user = null;
  let otherUser = null;
  let token = null;
  let companyType = null;

  before(function(done) {
    setup()
      .then(function() {
        return db.User.find({});
      })
      .then(function(users) {
        user = users.find(u => u.firstName === 'Bob');
        otherUser = users.find(u => u.firstName === 'Alice');
        token = login(user);
        return db.Type.findOne({ name: 'Company' });
      })
      .then(function(type) {
        companyType = type;
        done();
      })
      .catch(done);
  });

  describe('GET /users/:userId/activities/', function() {
    it("responds with all of this user's activities if token is valid", function(
      done
    ) {
      request(app)
        .get(`/users/${user.id}/activities/`)
        .set('authorization', 'Bearer: ' + token)
        .expect(200)
        .expect(function(res) {
          expect(res.body.length).to.equal(3);
          expect(res.body.map(a => a.name)).to.have.members([
            'Job Search',
            "Bob's Job Search",
            "Bob's Other Job Search"
          ]);
          const bobStages = res.body[0].stages.concat(
            res.body[1].stages,
            res.body[2].stages
          );
          expect(bobStages.length).to.equal(7);
          expect(bobStages.map(s => s.name)).to.have.members([
            "Bob's Ideas",
            "Bob's Other Ideas",
            "Bob's Other Research",
            "Bob's Other Follow Up",
            'Research',
            'Follow Up',
            'Apply'
          ]);
        })
        .end(done);
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .get(`/users/${user.id}/activities/`)
        .expect(
          401,
          {
            message: 'You must be logged in to continue.'
          },
          done
        );
    });
  });

  describe('POST /users/:userId/activities', function() {
    it('creates an activity for a user if token is valid', function(done) {
      request(app)
        .post(`/users/${user.id}/activities`)
        .send({
          name: "Bob's latest job search",
          rootAssetType: companyType.id
        })
        .set('authorization', 'Bearer: ' + token)
        .expect(200)
        .expect(function(res, request) {
          expect(res.body.name).to.equal("Bob's latest job search");
          expect(res.body.id).to.not.be.null;
          expect(res.body.createdBy).to.equal(user.id);
        })
        .end(done);
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .post(`/users/${user.id}/activities`)
        .send({
          name: 'Job Search 2017',
          rootAssetType: companyType.id
        })
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
        .post(`/users/${user.id}/activities`)
        .send({
          name: 'Job Search 2017',
          rootAssetType: companyType.id
        })
        .set('authorization', 'Bearer: ' + token2)
        .expect(
          401,
          {
            message: 'Unauthorized'
          },
          done
        );
    });
  });

  after(teardown);
});

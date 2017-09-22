const db = require('../../models');
const app = require('../../app');
const login = require('../helpers').login;
const setup = require('../seed').setup;
const teardown = require('../seed').teardown;
const request = require('supertest');
const expect = require('chai').expect;

describe('Asset routes', function() {
  let type = null;
  let user = null;

  beforeEach(function(done) {
    setup()
      .then(function() {
        return db.User.findOne({ firstName: 'Alice' });
      })
      .then(function(alice) {
        user = alice;
        return db.Type.findOne({ name: 'Company' }).populate('assets');
      })
      .then(function(company) {
        type = company;
        done();
      })
      .catch(done);
  });

  describe('GET /types/:id/assets', function() {
    it('responds with an array of assets if token is valid', function(done) {
      const token = login(user);
      request(app)
        .get(`/types/${type.id}/assets`)
        .set('authorization', 'Bearer: ' + token)
        .expect(200)
        .expect(function(res) {
          expect(res.body.isAgent).to.be.true;
          expect(res.body.name).to.equal('Company');
          expect(res.body.assets.length).to.equal(2);
          expect(res.body.assets.map(a => a.name)).to.have.members([
            'Google',
            'Facebook'
          ]);
        })
        .end(done);
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .get(`/types/${type.id}/assets`)
        .expect(
          401,
          {
            message: 'You must be logged in to continue.'
          },
          done
        );
    });
  });

  describe('POST /types/:id/assets', function() {
    it('creates a new asset of the given type if token is valid', function(
      done
    ) {
      const token = login(user);
      request(app)
        .post(`/types/${type.id}/assets`)
        .send({
          name: 'Amazon',
          url: 'https://www.amazon.com/',
          logo: 'amazon logo'
        })
        .set('authorization', 'Bearer: ' + token)
        .expect(200)
        .expect(function(res) {
          expect(res.body.name).to.equal('Amazon');
          expect(res.body.url).to.equal('https://www.amazon.com/');
          expect(res.body.logo).to.equal('amazon logo');
          expect(res.body.id).to.not.be.null;
        })
        .end(done);
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .post(`/types/${type.id}/assets`)
        .send({ random: 'data' })
        .expect(
          401,
          {
            message: 'You must be logged in to continue.'
          },
          done
        );
    });
  });

  describe('PATCH /types/:typeId/assets/:assetId', function() {
    it('updates an asset of the given type if token is valid', function(done) {
      const token = login(user);
      const google = type.assets.find(a => a.name === 'Google');
      request(app)
        .patch(`/types/${type.id}/assets/${google.id}`)
        .send({
          name: 'New Google'
        })
        .set('authorization', 'Bearer: ' + token)
        .expect(200)
        .expect(function(res) {
          expect(res.body.name).to.equal('New Google');
          expect(res.body.url).to.equal('google.com');
        })
        .end(done);
    });

    it('is invalid if there is no token', function(done) {
      const google = type.assets.find(a => a.name === 'Google');
      request(app)
        .patch(`/types/${type.id}/assets/${google.id}`)
        .send({ random: 'data' })
        .expect(
          401,
          {
            message: 'You must be logged in to continue.'
          },
          done
        );
    });

    it('ensures that the user is authorized', function(done) {
      const token = login(user);
      const facebook = type.assets.find(a => a.name === 'Facebook');
      request(app)
        .patch(`/types/${type.id}/assets/${facebook.id}`)
        .send({
          name: 'fail'
        })
        .set('authorization', 'Bearer: ' + token)
        .expect(
          401,
          {
            message: 'Unauthorized'
          },
          done
        );
    });
  });

  describe('DELETE /types/:typeId/assets/:assetId', function() {
    it('deletes an asset if the token is valid', function(done) {
      const token = login(user);
      const google = type.assets.find(a => a.name === 'Google');
      request(app)
        .delete(`/types/${type.id}/assets/${google.id}`)
        .set('authorization', 'Bearer: ' + token)
        .expect(200)
        .expect(function(res, request) {
          expect(res.body).to.deep.equal({});
        })
        .end(function() {
          db.Asset
            .findById(google.id)
            .then(function(deletedAsset) {
              expect(deletedAsset).to.be.null;
              done();
            })
            .catch(done);
        });
    });

    it('it should be invalid if there is no token', function(done) {
      const google = type.assets.find(a => a.name === 'Google');
      request(app)
        .delete(`/types/${type.id}/assets/${google.id}`)
        .expect(
          401,
          {
            message: 'You must be logged in to continue.'
          },
          done
        );
    });

    it('ensures that the user is authorized', function(done) {
      const token = login(user);
      const facebook = type.assets.find(a => a.name === 'Facebook');
      request(app)
        .delete(`/types/${type.id}/assets/${facebook.id}`)
        .set('authorization', 'Bearer: ' + token)
        .expect(
          401,
          {
            message: 'Unauthorized'
          },
          done
        );
    });
  });

  afterEach(teardown);
});

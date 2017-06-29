const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/patterns-testDb');
const db = require("../../models");
const app = require("../../app");
const login = require("../helpers").login;
const testingData = require("../helpers").testingData;
const testingData2 = require('../helpers').testingData2;
const request = require('supertest');
const jwt = require('jsonwebtoken');
const expect = require('chai').expect;

describe('GET /assets/:a_id/childassets', function() {
  let asset = null;
  let child = null;
  let user = null;
  before(function(done) {
    db.User.create(testingData)
    .then(function(newUser){
      user = newUser;
      asset = new db.Asset({
        name:'Facebook',
        url:'https://www.facebook.com/',
        logo:'https://facebookbrand.com/wp-content/themes/fb-branding/prj-fb-branding/assets/images/fb-art.png',
        createdBy: user.id
      });
      return asset.save();
    })
    .then(function(newAsset) {
      asset = newAsset;
      child = new db.Asset({
        name:'Funding',
        createdBy: user.id
      })
      return child.save()
    })
    .then(function(child) {
      asset.assets.push(child._id);
      return asset.save()
    })
    .then(function() {
      done();
    })
    .catch(function(error){
      console.log(error);
    });
  });

  it('adds a child asset to asset list if token is valid', function(done) {
    const token = login(testingData);
    request(app)
      .get(`/assets/${asset.id}/childassets`)
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res) {
        expect(res.body.name).to.equal('Facebook');
        expect(res.body.url).to.equal('https://www.facebook.com/');
        expect(res.body.logo).to.equal('https://facebookbrand.com/wp-content/themes/fb-branding/prj-fb-branding/assets/images/fb-art.png');
        expect(res.body.assets.length).to.equal(1);
        expect(res.body.assets[0].name).to.equal('Funding');
      })
    .end(done);
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      done();
    })
  });
});

describe('POST /assets/:a_id/childassets', function() {
  let parent = null;
  let user = null;
  before(function(done) {
    db.User.create(testingData)
    .then(function(newUser){
      user = newUser;
      parent = new db.Asset({
        name:'Facebook',
        url:'https://www.facebook.com/',
        logo:'https://facebookbrand.com/wp-content/themes/fb-branding/prj-fb-branding/assets/images/fb-art.png',
        createdBy: user.id
      });
      return parent.save();
    })
    .then(function(parentAsset) {
      parent = parentAsset;
      done();
    })
    .catch(function(error){
      console.log(error);
    });
  })

  it('creates a child asset of a parent asset if token is valid', function(done) {
    const token = login(user);
    request(app)
      .post(`/assets/${parent.id}/childassets`)
      .send({
        name: 'Brand'
      })
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res, req) {
        expect(res.body.name).to.equal('Brand');
        expect(res.body.id).to.not.be.null;
        expect(res.body.parent._id).to.equal(parent.id);
      })
      .end(done);
  });

  it('it should be invalid if there is no token', function(done) {
    request(app)
      .post(`/assets/${parent.id}/childassets`)
      .send({random:"data"})
      .expect(401, {
        message: "You must be logged in to continue."
      }, done);
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      done();
    })
  });
});

describe('PATCH /assets/:a_id/childassets/:c_id', function() {
  let child = null;
  let parent = null;
  let user = null;
  before(function(done) {
    db.User.create(testingData)
    .then(function(newUser) {
      user = newUser;
      let asset = new db.Asset({
      name: 'Microsoft',
      url: 'https://www.microsoft.com/en-us/',
      logo: 'http://diylogodesigns.com/blog/wp-content/uploads/2016/04/Microsoft-Logo-PNG.png',
      createdBy: user.id
      });
      return asset.save();
    })
    .then(function(parentAsset) {
      parent = parentAsset;
    })
    .then(function() {
      child = new db.Asset({
        name: 'Brand',
        url: 'www.brand.com',
        parent: parent.id,
        createdBy: user.id
      })
      return child.save()
    })
    .then(function(child) {
      parent.assets.push(child._id);
      return parent.save()
    })
    .then(function() {
      done();
    })
    .catch(function(error){
      console.log(error);
    });
  });

  it("updates an asset if token is valid", function(done) {
    const token = login(user);
    request(app)
      .patch(`/assets/${parent.id}/childassets/${child.id}`)
      .send({
        name: 'Employees'
      })
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res, req) {
        expect(res.body.name).to.equal('Employees');
        expect(res.body.url).to.equal('www.brand.com');
      })
      .end(done);
  });

  it('it should be invalid if there is no token', function(done) {
    request(app)
      .patch(`/assets/${parent.id}/childassets/${child.id}`)
      .send({
        random: 'data'
      })
      .expect(401, {
        message: "You must be logged in to continue."
      }, done);
  });

  it("it should be unauthorized if attempted by another user", function(done) {
    const token2 = login(testingData2);
    request(app)
      .patch(`/assets/${parent.id}/childassets/${child.id}`)
      .send({random:"data"})
      .set('authorization', 'Bearer: ' + token2)
      .expect(401, {
        message: "Unauthorized"
      }, done);
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      done();
    })
  });
});

describe('DELETE /assets/:a_id/childassets/:c_id', function() {
  let parent = null; // Microsoft
  let child = null; // Brand (target)
  let grandchild = null; // Logo
  let user = null;
  before(function(done) {
    db.User.create(testingData)
    .then(function(newUser) {
      user = newUser;
      let asset = new db.Asset({
        name: 'Microsoft',
        url: 'https://www.microsoft.com/en-us/',
        logo: 'http://diylogodesigns.com/blog/wp-content/uploads/2016/04/Microsoft-Logo-PNG.png',
        createdBy: user.id
      });
      return asset.save();
    })
    .then(function(parentAsset) {
      parent = parentAsset;
    })
    .then(function() {
      child = new db.Asset({
        name: 'Brand',
        parent: parent.id,
        createdBy: user.id
      })
      return child.save()
    })
    .then(function(child) {
      parent.assets.push(child._id);
      return parent.save()
    })
    .then(function(parent) {
      grandchild = new db.Asset({
        name: 'Logo',
        parent: child.id,
        createdBy: user.id
      })
      return grandchild.save()
    })
    .then(function(grandchild) {
      child.assets.push(grandchild._id);
      return child.save()
    })
    .then(function() {
      done();
    })
    .catch(function(error){
      console.log(error);
    });
  });

  it("deletes target, target from parent's assets array, and target's descendants if token is valid", function(done) {
    const token = login(user);
    request(app)
      .delete(`/assets/${parent.id}/childassets/${child.id}`)
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res, req) {
        expect(res.body).to.deep.equal({});
        db.Asset.findById(parent.id)
        .then(function(foundParent) {
          expect(foundParent.assets.indexOf(child.id)).to.equal(-1);
        })
        .then(function(){
          db.Asset.findOne(grandchild);
        })
        .then(function(foundGrandchild) {
          expect(foundGrandchild).to.equal(null);
        })
        .then(function() {
          done();
        })
        .catch(function(error){
          console.log(error);
        });
      })
      .then(function() {
        done();
      })
      .catch(function(error){
        console.log(error);
      });
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .delete(`/assets/${parent.id}/childassets/${child.id}`)
        .expect(401, {
          message: "You must be logged in to continue."
        }, done);
    });

    it("it should be unauthorized if attempted by another user", function(done) {
      const token2 = login(testingData2);
      request(app)
        .delete(`/assets/${parent.id}/childassets/${child.id}`)
        .set('authorization', 'Bearer: ' + token2)
        .expect(401, {
          message: "Unauthorized"
        }, done);
    });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      done();
    })
  });
});

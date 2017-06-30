const db = require("../../models");
const app = require("../../app");
const login = require("../helpers").login;
const testingData = require("../helpers").testingData;
const testingData2 = require('../helpers').testingData2;
const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const expect = require('chai').expect;

xdescribe('GET /types', function() {
  let user = null;
  let type = null;
  before(function(done) {
    db.User.create(testingData)
    .then(function(newUser){
      user = newUser;
      type = new db.Type({
        isAgent: true,
        name: 'Company',
        createdBy: user.id
      });
      return type.save();
    })
    .then(function(newType) {
      type = newType;
      done();
    })
    .catch(done);
  });

  it('responds with a type if token is valid', function(done) { 
    const token = login(testingData);
    request(app)
      .get('/types')
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res) {
        expect(res.body[0].isAgent).to.be.true;
        expect(res.body[0].name).to.equal('Company');
      })
      .end(done);
  });

  it('it should be invalid if there is no token', function(done) {
    request(app)
      .get('/types')
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

xdescribe('POST /types', function() {
  let user = null;
  before(function(done) {
    db.User.create(testingData)
    .then(function(newUser){
      user = newUser;
      done();
    })
    .catch(function(error) {
      console.log(error);
    });
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
      .send({stuff: "here"})
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

xdescribe('PATCH /types/:t_id', function() {
  let type = null;
  let user = null;
  before(function(done) {
    db.User.create(testingData)
    .then(function(newUser) {
      user = newUser;
      let type = new db.Type({ 
        isAgent: false, 
        name: 'Corporation',
        createdBy: user.id
      })
      return type.save();
    })
    .then(function(newType){
      type = newType;
      done();
    })
    .catch(done);
  })

  it('updates a type if token is valid', function(done) {
    const token = login(user);
    request(app)
      .patch(`/types/${type.id}`)
      .send({
        name:'Business'
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
      .send({random:"data"})
      .expect(401, {
        message: "You must be logged in to continue."
      }, done);
  });

  it("it should be unauthorized if attempted by another user", function(done) {
  const token2 = login(testingData2);
  request(app)
    .patch(`/types/${type.id}`)
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

xdescribe('DELETE /types/:t_id', function() {
  let type = null;
  let asset = null;
  let user = null;
  before(function(done) {
    db.User.create(testingData)
    .then(function(newUser) {
      user = newUser;
      let type = new db.Type({
        isAgent: true,
        name: 'Employees',
        createdBy: user.id
      });
      return type.save();
    })
    .then(function(newType) {
      type = newType;
      return db.Asset.create({
        name: "Matt",
        typeId: type.id,
        createdBy: user.id
      });
    })
    .then(function(newAsset) {
      asset = newAsset;
      type.assets.push(asset);
      return type.save();
    })
    .then(function() {
      done();
    })
    .catch(done);
  });

  it('it should be invalid if there is no token', function(done) {
    request(app)
      .delete(`/types/${type.id}`)
      .expect(401, {
        message: "You must be logged in to continue."
      }, done);
  });

  it("it should be unauthorized if attempted by another user", function(done) {
    const token2 = login(testingData2);
    request(app)
      .delete(`/types/${type.id}`)
      .set('authorization', 'Bearer: ' + token2)
      .expect(401, {
        message: "Unauthorized"
      }, done);
  });

  it('deletes a type and all assets of that type if token is valid', function(done) { 
    const token = login(user);
    request(app)
      .delete(`/types/${type.id}`)
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body).to.deep.equal({});
        db.Asset.find({typeId: type.id})
        .then(function(foundAssets) {
          expect(foundAssets.length).to.equal(0);
        })
        .then(function() { 
          done();
        })
        .catch(done);
      });
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      done();
    })
  });
});

xdescribe('GET /types/:id/assets', function() {
  let type = null;
  let user = null;
  before(function(done) {
    db.User.create(testingData)
    .then(function(newUser){
      user = newUser;
      type = new db.Type({ 
        isAgent: false, 
        name:'Brand',
        createdBy: user.id
      })
      return type.save();
    })
    .then(function(newType) {
      type = newType;
      const asset = new db.Asset({
        name:'Google',
        url:'https://www.google.com/',
        logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2000px-Google_2015_logo.svg.png',
        createdBy: user.id
      })
      asset.typeId = type.id;
      return asset.save()
    })
    .then(function(asset) {
      type.assets.push(asset.id);
      return type.save()
    })
    .then(function() {
      done();
    })
    .catch(done);
  });

  it('responds with an array of assets if token is valid', function(done) {
    const token = login(testingData);
    request(app)
      .get(`/types/${type.id}/assets`)
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res) {
        expect(res.body.isAgent).to.be.false;
        expect(res.body.name).to.equal('Brand');
        expect(res.body.assets.length).to.equal(1);
        expect(res.body.assets[0].name).to.equal('Google');
        expect(res.body.assets[0].url).to.equal('https://www.google.com/');
        expect(res.body.assets[0].logo).to.equal('https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2000px-Google_2015_logo.svg.png');
      })
      .end(done);
  }); 

  it('it should be invalid if there is no token', function(done) {
    request(app)
      .get(`/types/${type.id}/assets`)
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

xdescribe('POST /types/:id/assets', function() {
  let type = null;
  let user = null;
  before(function(done) {
    db.User.create(testingData)
    .then(function(newUser){
      user = newUser;
      type = new db.Type({ 
        isAgent: false, 
        name: 'Conglomerate',
        createdBy: user.id
      });
      return type.save();
    })
    .then(function(newType) {
      type = newType;
      done();
    })
    .catch(done);
  })

  it('creates a new asset of the given type if token is valid', function(done) {
    const token = login(user);
    request(app)
      .post(`/types/${type.id}/assets`)
      .send({
        name:'Amazon',
        url:'https://www.amazon.com/',
        logo:'http://static1.businessinsider.com/image/539f3ffbecad044276726c01-960/amazon-com-logo.jpg'
      })
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res) {
        expect(res.body.name).to.equal('Amazon');
        expect(res.body.url).to.equal('https://www.amazon.com/');
        expect(res.body.logo).to.equal('http://static1.businessinsider.com/image/539f3ffbecad044276726c01-960/amazon-com-logo.jpg');
        expect(res.body.id).to.not.be.null;
      })
      .end(done);
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .post(`/types/${type.id}/assets`)
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

xdescribe('PATCH /types/:t_id/assets/:a_id', function() {
  let type = null;
  let asset = null;
  let user = null;
  before(function(done) {
    db.User.create(testingData)
    .then(function(newUser) {
      user = newUser;
      let type = new db.Type({ 
        isAgent: false, 
        name: 'Corporation',
        createdBy: user.id
      });
      return type.save();
    })
    .then(function(newType){
      type = newType;
      return db.Asset.create({
        name: 'Microsoft',
        url: 'https://www.microsoft.com/en-us/',
        logo: 'http://diylogodesigns.com/blog/wp-content/uploads/2016/04/Microsoft-Logo-PNG.png',
        typeId: newType.id,
        createdBy: user.id
      });
    })
    .then(function(newAsset) {
      asset = newAsset;
      type.assets.push(asset._id);
      return type.save()
    })
    .then(function() {
      done();
    })
    .catch(done);
  })

  it('updates an asset of the given type if token is valid', function(done) {
    const token = login(user);
    request(app)
      .patch(`/types/${type.id}/assets/${asset.id}`)
      .send({
        name:'Amazon'
      })
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res) {
        expect(res.body.name).to.equal('Amazon');
        expect(res.body.url).to.equal('https://www.microsoft.com/en-us/');
      })
      .end(done);
    });

    it('it should be invalid if there is no token', function(done) {
      request(app)
        .patch(`/types/${type.id}/assets/${asset.id}`)
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

xdescribe('DELETE /types/:t_id/assets/:a_id', function() {
  let asset = null; // Microsoft
  let type = null; // Corporation
  let user = null;
  before(function(done) {
    db.User.create(testingData)
    .then(function(newUser) {
      user = newUser;
      let type = new db.Type({ 
        isAgent: false, 
        name: 'Corporation',
        createdBy: user.id
      });
      return type.save();
    })
    .then(function(newType){
      type = newType;
      return db.Asset.create({
        name: 'Microsoft',
        url: 'https://www.microsoft.com/en-us/',
        logo: 'http://diylogodesigns.com/blog/wp-content/uploads/2016/04/Microsoft-Logo-PNG.png',
        typeId: type.id,
        createdBy: user.id
      });
    })
    .then(function(newAsset) {
      asset = newAsset;
      type.assets.push(asset._id);
      return type.save()
    })
    .then(function() {
      done();
    })
    .catch(done);
  })

  it("deletes asset of a certain type and asset's descendants if token is valid", function(done) {
    const token = login(user);
    request(app)
      .delete(`/types/${type.id}/assets/${asset.id}`)
      .set('authorization', 'Bearer: ' + token)
      .expect(200)
      .expect(function(res, req) {
        expect(res.body).to.deep.equal({});
      })
      .end(function() {
        db.Type.findById(type.id)
        .then(function(foundType) {
          expect(foundType.assets.indexOf(asset.id)).to.equal(-1);
        })
        .then(function(){
          return db.Asset.findOne(asset);
        })
        .then(function(foundAsset) {
          expect(foundAsset).to.be.null;
          done();
        })
        .catch(done)
      });
  });

  it('it should be invalid if there is no token', function(done) {
    request(app)
      .delete(`/types/${type.id}/assets/${asset.id}`)
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

const expect = require('chai').expect;
const db = require('../../models');
const setup = require('../seed').setup;
const teardown = require('../seed').teardown;
 
describe('Asset model', function() {

  describe('Basic validations', function() {

    it('should be invalid if name is empty', function(done) {
      const a = new db.Asset();
      a.validate(function(err) {
        expect(err.errors.name).to.exist;
        done();
      });
    });

    it('should be invalid if createdBy is empty', function(done) {
      const a = new db.Asset();
      a.validate(function(err) {
        expect(err.errors.createdBy).to.exist;
        done();
      });
    });

    it('should be invalid if typeId is empty', function(done) {
      const a = new db.Asset();
      a.validate(function(err) {
        expect(err.errors.typeId).to.exist;
        done();
      });
    });

    it('should create a default createdAt date', function(done) {
      const a = new db.Asset( { name: 'company '});
      expect(a.createdAt).to.be.a('date');
      done();
    });

    it('should create a default updatedAt date', function(done) {
      const a = new db.Asset( { name: 'company '});
      expect(a.updatedAt).to.be.a('date');
      done();
    });

  });

  describe('Pre-save hook', function() {

    let user = null;

    before(function(done) {
      setup().then(function() {
        return db.User.findOne({firstName: "Alice"});
      })
      .then(function(alice) {
        user = alice;
        done();
      })
      .catch(done);
    });

    it("should update its type's array of assets", function(done) {
      let companyOld = null;
      db.Type.findOne({name: "Company"})
      .then(function(company) {
        companyOld = company;
        return db.Asset.create({
          name: "New Company",
          url: "newcompany.com",
          logo: "new company logo",
          typeId: companyOld.id,
          createdBy: user.id
        });
      })
      .then(function() {
        return db.Type.findOne({name: "Company"}).populate('assets');
      })
      .then(function(companyNew) {
        expect(companyNew.assets.length).to.equal(companyOld.assets.length + 1);
        expect(companyNew.assets.map(a => a.name)).to.include("New Company");
        done();
      })
      .catch(done);

    });

    it("should update its parent asset's array of assets, if it has a parent", function(done) {
      let googleOld = null;
      let brandId = null;
      db.Asset.findOne({name: "Google"})
      .then(function(google) {
        googleOld = google;
        return db.Type.findOne({name: "Brand"});
      })
      .then(function(brand) {
        brandId = brand.id;
        return db.Asset.create({
          name: "Google New Brand",
          typeId: brandId,
          createdBy: user.id,
          parent: googleOld.id
        });
      })
      .then(function() {
        return db.Asset.findOne({name: "Google"}).populate('assets');
      })
      .then(function(googleNew) {
        expect(googleNew.assets.length).to.equal(googleOld.assets.length + 1);
        expect(googleNew.assets.map(a => a.name)).to.include("Google New Brand");
        done();
      })
      .catch(done);
    });

    after(teardown);
  });

  describe('Pre-remove hook', function() {

    let user = null;

    before(function(done) {
      setup().then(function() {
        return db.User.findOne({firstName: "Alice"});
      })
      .then(function(alice) {
        user = alice;
        done();
      })
      .catch(done);
    });

    xit("should remove all of its child assets", function(done) {

    });

    xit("should be removed from its parent's array of assets, if it has a parent", function(done) {

    });

    xit("should be removed from its type's array of assets", function(done) {

    });

    xit("should be removed from all stages containing it", function(done) {

    });

    after(teardown);

  });

});

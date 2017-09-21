const mongoose = require('mongoose');
const db = require('../models');

function setup(done) {
  let users = [];
  let types = [];
  let activities = [];
  let companies = [];
  let stages = [];
  return db.User
    .create({
      googleId: '1',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com'
    })
    .then(function(alice) {
      users = [alice];
      // need to run user creation sequentially to avoid
      // creating two company types
      return db.User.create({
        googleId: '2',
        firstName: 'Bob',
        lastName: 'Jones',
        email: 'bob@example.com'
      });
    })
    .then(function(bob) {
      users.push(bob);
      return db.Type.create([
        {
          isAgent: false,
          name: 'Brand',
          createdBy: users[1].id
        },
        {
          isAgent: true,
          name: 'Employees',
          createdBy: users[0].id
        }
      ]);
    })
    .then(function(createdTypes) {
      types = createdTypes;
      return db.Type.findOne({ name: 'Company' });
    })
    .then(function(company) {
      types.unshift(company);
    })
    .then(function(createdTypes) {
      return db.Asset.create([
        {
          name: 'Google',
          url: 'google.com',
          logo: 'google logo',
          typeId: types[0].id,
          createdBy: users[0].id
        },
        {
          name: 'Facebook',
          url: 'facebook.com',
          logo: 'facebook logo',
          typeId: types[0].id,
          createdBy: users[1].id
        }
      ]);
    })
    .then(function(parentAssets) {
      companies = parentAssets;
      let google = parentAssets.find(a => a.name === 'Google');
      let facebook = parentAssets.find(a => a.name === 'Facebook');
      let brand = types.find(t => t.name === 'Brand');
      let employees = types.find(t => t.name === 'Employees');
      return db.Asset.create([
        {
          name: 'Google Brand',
          typeId: brand.id,
          createdBy: users[0].id,
          parent: google.id
        },
        {
          name: 'Google Employees',
          typeId: employees.id,
          createdBy: users[0].id,
          parent: google.id
        },
        {
          name: 'Facebook Brand',
          typeId: brand.id,
          createdBy: users[1].id,
          parent: facebook.id
        },
        {
          name: 'Facebook Employees',
          typeId: employees.id,
          createdBy: users[1].id,
          parent: facebook.id
        }
      ]);
    })
    .then(function(childAssets) {
      let brand = types.find(t => t.name === 'Brand');
      return db.Asset.create(
        childAssets.reduce(
          (acc, asset) =>
            acc.concat(
              {
                name: asset.name + ' subasset',
                typeId: asset.typeId,
                createdBy: asset.createdBy,
                parent: asset.id
              },
              {
                name: asset.name + ' another subasset',
                typeId: asset.typeId,
                createdBy: asset.createdBy,
                parent: asset.id
              }
            ),
          []
        )
      );
    })
    .then(function() {
      return db.Activity.create([
        {
          name: "Alice's Job Search",
          createdBy: users[0].id,
          rootAssetType: types[0].id
        },
        {
          name: "Bob's Job Search",
          createdBy: users[1].id,
          rootAssetType: types[0].id
        },
        {
          name: "Bob's Other Job Search",
          createdBy: users[1].id,
          rootAssetType: types[0].id
        }
      ]);
    })
    .then(function(createdActivities) {
      activities = createdActivities;
      return db.Stage.create([
        {
          name: "Alice's Research",
          createdBy: users[0].id,
          activity: activities[0].id
        },
        {
          name: "Alice's Follow Up",
          createdBy: users[0].id,
          activity: activities[0].id
        },
        {
          name: "Bob's Ideas",
          createdBy: users[1].id,
          activity: activities[1].id
        },
        {
          name: "Bob's Other Ideas",
          createdBy: users[1].id,
          activity: activities[2].id
        },
        {
          name: "Bob's Other Research",
          createdBy: users[1].id,
          activity: activities[2].id
        },
        {
          name: "Bob's Other Follow Up",
          createdBy: users[1].id,
          activity: activities[2].id
        }
      ]);
    })
    .then(function(newStages) {
      stages = newStages;
      let bobIdeas = stages.find(s => s.name === "Bob's Ideas");
      bobIdeas.assets.push(companies[0].id);
      bobIdeas.assets.push(companies[1].id);
      return bobIdeas.save();
    })
    .then(function() {
      let bobOtherIdeas = stages.find(s => s.name === "Bob's Other Ideas");
      let google = companies.find(c => c.name === 'Google');
      bobOtherIdeas.assets.push(google.id);
      return bobOtherIdeas.save();
    })
    .then(function() {
      let bobOtherResearch = stages.find(
        s => s.name === "Bob's Other Research"
      );
      let facebook = companies.find(c => c.name === 'Facebook');
      bobOtherResearch.assets.push(facebook.id);
      return bobOtherResearch.save();
    });
}

function teardown(done) {
  mongoose.connection.db.dropDatabase(function() {
    done();
  });
}

module.exports = { setup, teardown };

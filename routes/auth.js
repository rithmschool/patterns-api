let express = require("express");
let router = express.Router();
let jwt = require('jsonwebtoken');
let passport = require("passport");
let db = require("../models");
let cors = require("cors");
let axios = require('axios');
let qs = require("qs");

router.get('/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/plus.login',
      'profile', 
      'email'
    ]
  })
);

router.post('/google/callback',
  function(request, response) {
    let user = null;
    let type = null;
    let activity = null;
    let stages = null;
    let token = null;
    let newUser = null;
    axios({
      method: 'post',
      url: 'https://www.googleapis.com/oauth2/v4/token',
      data: qs.stringify({
        code: request.body.code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.CALLBACK_URL,
        grant_type: 'authorization_code'
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded' 
      }
    })
    .then(function(res){
      return axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${res.data.access_token}`);
    })
    .then(function(res){
      return db.User.findOrCreate({ 
        googleId: res.data.id, 
        firstName: res.data.given_name, 
        lastName: res.data.family_name,
        email:res.data.email 
      });
    })
    .then(function(currentUser) {
      const payload = {
        googleId: currentUser.googleId,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        mongoId: currentUser._id
      };
      token = jwt.sign(payload, process.env.SECRET_KEY);
      return currentUser;
    })
    .then(function(currentUser){
      user = currentUser.doc;
      return db.Type.count({name: "Company"});
    })
    .then(function(count){
      if (count === 0) { 
        newUser = true;
        type = new db.Type({
          isAgent: true,
          name: "Company",
          createdBy: user.id
        });
        type.save();
      } else {
        newUser = false;
        type = db.Type.findOne({name: "Company"});
      }
      return type;
    })
    .then(function(newType){
      type = newType;
      userId = type.createdBy;
      if (newUser) {
        activity = new db.Activity({
          name: "Job Search",
          user: userId,
          rootAssetType: type.id
        });
        return activity.save();
      } else {
        return null;
      }
    })
    .then(function(newActivity){
      if (newUser) {
        activity = newActivity;
        userId = activity.user;
        return db.Stage.create([
        {
          name: "Research",
          activity: activity.id,
          createdBy: userId
        },{
          name: "Apply",
          activity: activity.id,
          createdBy: userId
        },{
          name: "Follow Up",
          activity: activity.id,
          createdBy: userId
        }
        ]);
      } else {
        return null;
      }
    })
    .then(function(stages){
      if (newUser) {
        activity.stages.push(...stages);
        return activity.save();
      } else {
        return null;
      }
    })
    .then(function(activity){
      if (newUser) {
        user.activities.push(activity);
        return user.save();
      } else {
        return null;
      }  
    })
    .then(function(){
      response.status(200).send(token);
    })
    .catch(function(error) {
      console.log("ERR", error);
      response.status(500).send(error);
    });
  }
);

module.exports = router;

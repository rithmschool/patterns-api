const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require("passport");
const db = require("../models");
const cors = require("cors");
const axios = require('axios');
const qs = require("qs");

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
    let token = null;
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
      let user = currentUser.doc;
      const payload = {
        googleId: user.googleId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mongoId: user._id
      };
      token = jwt.sign(payload, process.env.SECRET_KEY);
      return null;
    })
    .then(function(){
      response.status(200).send(token);
    })
    .catch(function(error) {
      response.status(500).send(error);
    });
  }
);

module.exports = router;

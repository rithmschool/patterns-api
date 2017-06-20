var express = require("express");
var app = express();
var methodOverride = require("method-override");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var jwt= require('jsonwebtoken');
var passport = require("passport");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var session = require("cookie-session");
var flash = require("connect-flash");  // this lets us display messages to the user e.g. Logged in!
var db = require("./models");
require('locus'); 

if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config()
}

app.use(express.static(__dirname + "/public"));
app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

app.use(session({ secret: process.env.SECRET_KEY }));
app.use(passport.initialize());
// app.use(passport.session());
app.use(flash());


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || "http://localhost:3000/auth/google/callback", // put CALLBACK_URL in .env file when you know what that route will be
    session: false,
    passReqToCallback: true
},
  function(req, reqaccessToken, refreshToken, profile, done) {
     db.User.findOrCreate({ googleId: profile.id, firstName: profile.name.givenName, lastName: profile.name.familyName }, function (err, user) {
      eval(require("locus"))
      if (err) {return done(err)}
      const payload = {
        sub: user.googleId
      }
      const token = jwt.sign(payload, process.env.SECRET_KEY);
      const data = {firstName: user.firstName, lastName: user.lastName}
      console.log(token)
      return done(null, token, data);
     });
  }
));
 
app.get('/auth/google',
  passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login','https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],session:false }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  function(req, res) {
    // console.log("hello", res)
    eval(require("locus"))
    res.redirect('/');
  });

// // this code is ONLY run if the verify callback returns the done callback with no errors and a truthy value as the second parameter. 
//This code only runs once per session and runs a callback function which we can assume will 
// not have any errors (null as the first parameter) and the data we want to put in the session (only the user.id). The successCallback is run next!

// passport.serializeUser(function(user, done) {
//   done(null, user.googleId);
// });

// // once a user has been authenticated and serialized, we now find that user in the database on every request. 
// // This allows passport to have some useful methods on the request object like req.user (the current user logged in) 
// // and req.isAuthenticated() (returns true if the user is logged in or false if not)

// passport.deserializeUser(function(id, done) {
//   db.User.findById(id, function(err, user) {
//     done(err, user);
//   });
// });

app.get('/logout', function(req, res){
  req.logout();
  req.flash('message', 'logged out!');
  res.send('logged out')
})

app.listen(3001, function(){
  console.log("Server is listening on port 3001");
});


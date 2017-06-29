let express = require("express");
let app = express();
let methodOverride = require("method-override");
let bodyParser = require("body-parser");
let passport = require("passport");
let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let cors = require("cors");
let PORT = process.env.PORT || 3001;

let authRoutes = require('./routes/auth');
let typesRoutes = require('./routes/types');
let assetRoutes = require('./routes/assets');
let activitiesRoutes = require('./routes/activities');
let loginRequired = require('./routes/helpers').loginRequired;

if (process.env.NODE_ENV !== 'production') {
  let morgan = require("morgan");
  require("dotenv").config();
  app.use(morgan("tiny"));
}

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(cors());
app.use(passport.initialize());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
  session: false,
  passReqToCallback: true
},
  function(req, reqaccessToken, refreshToken, profile, done) {
    return done(null);
  }
));

app.use('/auth', authRoutes);
app.use('/types', loginRequired, typesRoutes);
app.use('/assets/:a_id/childassets', loginRequired, assetRoutes);
app.use('/users/:u_id/activities', loginRequired, activitiesRoutes);

app.listen(PORT, function() {
  console.log("Server is listening");
});

module.exports = app;

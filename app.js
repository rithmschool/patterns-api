const express = require('express');
const app = express();
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const cors = require('cors');
const config = require('./config');

const authRoutes = require('./routes/auth');
const typesRoutes = require('./routes/types');
const assetRoutes = require('./routes/assets');
const activitiesRoutes = require('./routes/activities');
const stagesRoutes = require('./routes/stages');
const loginRequired = require('./routes/helpers').loginRequired;

if (config.useEnv) {
  require('dotenv').config();
}

if (config.useMorgan) {
  var morgan = require('morgan');
  app.use(morgan('tiny'));
}

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(cors());
app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      session: false,
      passReqToCallback: true
    },
    (request, reqaccessToken, refreshToken, profile, done) => done(null)
  )
);

app.use('/auth', authRoutes);
app.use('/types', loginRequired, typesRoutes);
app.use('/types/:typeId/assets', loginRequired, assetRoutes);
app.use('/users/:userId/activities', loginRequired, activitiesRoutes);
app.use('/stages', loginRequired, stagesRoutes);

app.listen(config.port, () => {
  console.log(`Server is listening on port: ${config.port}`);  // eslint-disable-line no-console
});

module.exports = app;

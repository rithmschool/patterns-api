const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    mongooseDebug: true,
    mongoUri: 'mongodb://localhost/patterns',
    port: 3001,
    useEnv: true,
    useMorgan: true
  },
  test: {
    mongooseDebug: false,
    mongoUri: 'mongodb://localhost/patterns-test',
    port: 3002,
    useEnv: true,
    useMorgan: false
  },
  production: {
    mongooseDebug: false,
    mongoUri: process.env.MONGODB_URI,
    port: process.env.PORT,
    useEnv: false,
    useMorgan: false
  }
};

module.exports = config[env];

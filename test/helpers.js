const jwt = require('jsonwebtoken');

const testingData = {
  googleId: "623987ygvjhsbd2923uhcsdhb2390usdhjb",
  firstName:"Testing",
  lastName:"Patterns-Api",
  email:"testing.patterns.api@gmail.com",
};

function login(user){
  return jwt.sign(user, process.env.SECRET_KEY)
}

module.exports = { login, testingData };

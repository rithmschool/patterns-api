const jwt = require('jsonwebtoken');

const testingData = {
  googleId: "623987ygvjhsbd2923uhcsdhb2390usdhjb",
  firstName: "Testing",
  lastName: "Patterns-Api",
  email: "testing.patterns.api@gmail.com"
};

const testingData2 = {
  googleId: "098234eslkjlkjd908230471245lkjsddss",
  firstName: "Testing2",
  lastName: "Patterns-Api",
  email: "testing.patterns2.api@gmail.com"
};

function login(user){
  const payload = {
    googleId: user.googleId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    mongoId: user.id
  };
  return jwt.sign(payload, process.env.SECRET_KEY);
}

module.exports = { login, testingData, testingData2 };

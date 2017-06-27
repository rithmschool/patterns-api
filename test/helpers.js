const jwt = require('jsonwebtoken');

<<<<<<< HEAD
=======
const testingData = {
  googleId: "623987ygvjhsbd2923uhcsdhb2390usdhjb",
  firstName:"Testing",
  lastName:"Patterns-Api",
  email:"testing.patterns.api@gmail.com",
};

>>>>>>> f34f6c8fb1ffddd17e99044b72df00a525dff847
function login(user){
  return jwt.sign(user, process.env.SECRET_KEY)
}

<<<<<<< HEAD
module.exports = login;
=======
module.exports = { login, testingData };
>>>>>>> f34f6c8fb1ffddd17e99044b72df00a525dff847

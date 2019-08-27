const jwt = require("jsonwebtoken");
const PRIVATE_KEY = "private-key";
const TOKEN_EXPIRATION_TIME = "1h";

const authToken = {};

authToken.sign = user => {
  if (user.password) {
    throw new Error("invalid user property: password");
  }

  try {
    return jwt.sign(user , PRIVATE_KEY, {
      expiresIn: TOKEN_EXPIRATION_TIME
    });
  } catch (err) {
    throw new Error(err.message);
  }
};

authToken.verify = token => {
  try {
    return jwt.verify(token, PRIVATE_KEY);
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = authToken;

const authToken = require("./auth_token");
const User = require("../db/schema/user");

exports.authenticate = async (req, res, next) => {
  try {
    let token = req.headers["authorization"].replace("Bearer ", "");
    const decoded = authToken.verify(token);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token
    });
    if (user) {
      req.user = user;
      req.token = token;
      next();
    } else {
      throw new Error("user not found");
    }
  } catch (err) {
    console.log("invalid token", err.message);
    res.status(401).send();
  }
};

exports.cleanExpiredTokens = async user => {
  const tokens = user.tokens.filter(tokenOjb => {
    try {
      authToken.verify(tokenOjb.token);
      return false;
    } catch (err) {
      return true
    }
  });
  return tokens
};
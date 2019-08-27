const mongoose = require("../mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const authToken = require("../../auth/auth_token");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxLength: [30, "Name is too long"]
  },
  password: {
    type: String,
    required: [true, "You need to set a password"],
    trim: true,
    minlength: [4, "Your password need to have at least 4 characters"],
    maxLength: [8, "Your password can have at maximun 8 characters"]
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxLength: [50, "email is too long"]
  },
  birthDate: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, "The date format is dd/mm/aaaa"],
    maxLength: [10, "The date format is dd/mm/aaaa"]
  },
  tokens: {
    type: [
      {
        token: {
          type: String,
          trim: true
        }
      }
    ],
    maxLength: 3
  }
});

userSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  if (!validator.isEmail(user.email)) {
    return new Promise((resolve, reject) => {
      reject(new Error("invalid email"));
    });
  }

  next();
});

userSchema.methods.getUserNoCredentials = function() {
  const user = this;
  const { password, tokens, ...userNoPass } = user._doc ? user._doc : user;
  return userNoPass;
};

userSchema.methods.setNewToken = function() {
  const user = this;
  const userNoCredentials = user.getUserNoCredentials();
  const newToken = authToken.sign(userNoCredentials);
  user.tokens.push({token: newToken});
};

userSchema.methods.getLastToken = function() {
  const user = this;
  return user.tokens[user.tokens.length - 1].token
};

const User = mongoose.model("User", userSchema);

User.findWithCredentials = async (email, password) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User not found");
    }

    passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return user;
    } else {
      throw new Error("invalid password");
    }
  } catch (err) {
    throw err;
  }
};

module.exports = User;

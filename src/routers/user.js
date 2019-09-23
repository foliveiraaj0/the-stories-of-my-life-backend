const express = require("express");
const router = new express.Router();
const User = require("../db/schema/user");
const authRouter = require("../auth/auth_router");
var cors = require("cors");

var corsOptions = {
  origin: function (origin, cb) {
 
	    //console.log(origin);

            // setup a white list
            let wl = ['https://the-stories-of-my-life-fe.herokuapp.com', 'http://localhost:9001'];
 	    for(let i=0; i< wl.length; i++) {
  	        if (!origin || wl[i].indexOf(origin) != -1) {
 		    cb(null, true);
 	    	}
	    } 
            cb(new Error('invalid origin: ' + origin), false);
 
        },
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

router.post("/v1/signin", async (req, res) => {
  const { name, password, email, birthDate } = req.body;

  let user = await User.findOne({ email: email });

  if (user) {
    console.log("error", "An user with this email already exists");
    return res.status(400).send();
  }

  user = new User({
    name: name,
    password: password,
    email: email,
    birthDate: birthDate
  });

  try {
    user.setNewToken();
    await user.save();
    const userNoCredentials = user.getUserNoCredentials()
    userNoCredentials.token = user.getLastToken()
    res.status(201).send(userNoCredentials);
  } catch (err) {
    console.log("Signin error", err);
    res.status(400).send();
  }
});

router.post("/v1/login", cors(corsOptions), async (req, res) => {
  let { email, password } = req.body;

  try {
    let user = await User.findWithCredentials(email, password);

    user.setNewToken();

    await user.save();

    const userNoCredentials = user.getUserNoCredentials()
    userNoCredentials.token = user.getLastToken()
    res.status(200).send(userNoCredentials);
  } catch (err) {
    console.log(err.message ? err.message : err);
    res.status(400).send();
  }
});

router.post("/v1/logout", authRouter.authenticate, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(tokenObj => {
      return tokenObj.token && tokenObj.token !== req.token;
    });
    req.user.tokens = authRouter.cleanExpiredTokens(req.user);
    await req.user.save();
    res.status(200).send(req.user.getUserNoCredentials());
  } catch (err) {
    console.log("logout error", err.message ? err.message : err);
    res.status(400).send();
  }
});

router.get("/v1/user", authRouter.authenticate, async (req, res) => {
  try {
    try {
      const user = req.user;
      res.status(200).send(user.getUserNoCredentials());
    } catch (err) {
      console.log(
        "An error occurred while searching by the the passed user.",
        err.message
      );
      res.status(400).send();
    }
  } catch (err) {
    res.status(401).send();
  }
});

router.patch("/v1/user", authRouter.authenticate, async (req, res) => {
  try {
    const updatableProps = ["name", "email", "password", "dateBirth"];
    let user = req.user;
    updatableProps.forEach(prop => {
      if (req.body[prop]) {
        user[prop] = req.body[prop];
      }
    });
    user = await user.save();
    res.status(200).send(user.getUserNoCredentials());
  } catch (err) {
    console.log(
      "An error occurred while searching by the the passed user.",
      err.message
    );
    res.status(400).send();
  }
});

module.exports = router;

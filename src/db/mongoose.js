const db = require("mongoose");

db.connect("mongodb://127.0.0.1:27017/the-stories-of-my-life", {
  useNewUrlParser: true,
  useCreateIndex: true
},
(connectionError) => {
  if(connectionError) {
    console.log(connectionError);
  }
});

module.exports = db;

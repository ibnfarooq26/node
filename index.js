const express = require("express"); // es5
const router = express.Router();
const mysql = require("mysql2");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { hash } = require("bcrypt");
var jwt = require("jsonwebtoken");
require("dotenv").config();

const saltRounds = 15;
const { Schema } = mongoose;
const dbUrl = process.env.DB_URL;
mongoose
  .connect(dbUrl)
  .then((result) => {
    app.listen(PORT, () => {
      console.log(`server is running at ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
const PORT = 3000;
// middle Wear

app.use(express.json());
router.use("/home", (req, res, next) => {
  const { token } = req.body;
  if (token) {
    jwt.verify(token, "password", (err, decoded) => {
      if (err) {
        res.status(500).json({
          message: "error occured in the server side",
          success: false,
        });
      }
      if (decoded) {
        next();
      }
    });
  } else {
    res.status(400).json({
      message: "unauthorised",
      success: false,
    });
  }
});

// creatign a schema
const schema = new Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
});

// creating a model
const User = mongoose.model("user", schema);

app.get("/user", (req, res) => {
  const { id } = req.query;
  res.send(`hello browser ur id is${id}`);
});

app.post("/postInDb", (req, res) => {
  const { name, email, password } = req.body;
  console.log("the value is ", name, email, password);

  User.create({ name: name, email: email, password: hash });
  //
});
app.get("/getData", (req, res) => {
  const { id } = req.query;
  connection.query(
    `SELECT id, name, email, password FROM user WHERE id=${id}`,
    function (err, results) {
      if (err) {
        console.log("the error is ", err);
      }
      console.log(results); // results contains rows returned by server
      res.send(results);
    }
  );
});

app.delete("/delete", (req, res) => {
  const { id } = req.query;
  connection.query(`DELETE FROM user WHERE id=${id}`, function (err, results) {
    if (err) {
      console.log("the error is ", err);
    }
    console.log(results); // results contains rows returned by server
    res.send(results);
  });
});

app.post("/addData", (req, res) => {
  const { name, email, password } = req.body;

  bcrypt.genSalt(saltRounds, function (err, salt) {
    console.log("the salt is ", salt);
    bcrypt.hash(password, salt, function (err, hash) {
      console.log("the hash is ", hash);
      User.create({ name, email, password: hash }).then((user) => {
        if (user) {
          res.send(user);
        }
      });
    });
  });
});

app.get("/verfiyPwd", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email: email } });
  const hash = user.password;

  bcrypt.compare(password, hash, function (err, result) {
    if (result) {
      res.send("pwd verified");
    }
  });
});
app.get("/login", (req, res) => {
  const { name, password } = req.body;
  console.log("enters", name);
  User.findOne({ name: name }).then((user) => {
    if (user) {
      console.log("the user is ", user);
      let dbpwd = user.password;
      bcrypt.compare(password, dbpwd, function (err, result) {
        if (err) {
          res.send("error occured");
        }
        if (result) {
          // send token here
          var token = jwt.sign({ id: user.id, name: user.name }, "password");
          res.status(200).json({
            jwt: token,
            success: true,
          });
        } else {
          res.send("wrong password");
        }
      });
    } else {
      res.send("no such username in the database");
    }
  });
});

app.get("/home", (req, res) => {
  console.log("you are authenticated");
  res.send("authenticated to /home page");
});

//

// 123456===5678911==16 letter word
// salting 123456ABCD

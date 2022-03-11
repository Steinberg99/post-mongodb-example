const express = require("express");
const { MongoClient } = require("mongodb");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const app = express();

require("dotenv").config();

let port = 3000 || process.env.PORT;
let database;

app.set("view engine", "pug");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24;
app.use(
  sessions({
    secret: "dingding",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

app.get("/", async (req, res) => {
  let user = await database
    .collection("test_collection")
    .findOne({ name: "Stein Bergervoet" });

  console.log(user); // Log the user to the console

  res.render("index");
});

app.post("/test-post", async (req, res) => {
  await database
    .collection("test_collection")
    .insertOne({ name: req.body.name, age: req.body.age });

  let newUser = await database
    .collection("test_collection")
    .findOne({ name: req.body.name });

  console.log(newUser); // Log the new user to the database

  res.redirect("/");
});

const username = "Stein";
const password = "SuperCoolWachtwoord";

let session;

app.post("/login-test", async (req, res) => {
  console.log(req.body);
  if (req.body.username == username && req.body.password == password) {
    // Check if the username and password are correct
    console.log("Valid username and password");
    session = req.session;
    session.username = req.body.username;
    console.log(req.session);
    res.redirect("/login");
  } else {
    console.log("Invalid username or password");
    res.redirect("/");
  }
});

app.get("/login", (req, res) => {
  console.log(req.session.username); // Get the username from the session

  res.render("login", { username: req.session.username }); // Render the login page
});

// Connect to database
async function connectDB() {
  // Connection URL from .env file
  const client = new MongoClient(process.env.DB_URL, {
    retryWrites: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  try {
    await client.connect(); // Connect the client
    database = client.db(process.env.DB_NAME); // Get the database from the client
  } catch (error) {
    console.log(error);
  }
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  // When the server starts connect to the database
  connectDB().then(() => {
    console.log("Connected to MongoDB");
  });
});

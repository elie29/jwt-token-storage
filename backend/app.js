const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PORT, USERS } = require("./utils");
const { generateToken, validateToken } = require("./token");

// Load config from .env file
dotenv.config();

const app = express();

// from one origin only, and pass Access-Control-Allow-Credentials to true
app.use(cors({ origin: "http://localhost:4000", credentials: true }));

// json body is used for all endpoints
app.use(express.json());

// Endpoints
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "elie29" && password === "123456") {
    const token = generateToken(username);
    return res.status(200).send({ username, token });
  }

  return res.status(401).json("Invalid credentials");
});

// refresh token before expiration
app.post("/api/refresh", validateToken, (req, res) => {
  const username = req.body.username;
  const token = generateToken(username);

  return res.status(200).send({ username, token });
});

app.get("/api/users", validateToken, (_, res) => {
  return res.json(USERS);
});

// Launch the http server
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));

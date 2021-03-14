const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PORT, USERS } = require("./utils");
const { generateToken, validateToken } = require("./token");

// Load config from .env file
dotenv.config();

const app = express();
// cors and json body are used for all endpoints
app.use([cors(), express.json()]);

// Endpoints
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username === "elie29" && password === "123456") {
    const token = generateToken(req.body.username);
    return res.status(200).json({ username, token });
  }
  return res.status(401).json("Invalid credentials");
});

// refresh token before expiration
app.post("/refresh", validateToken, (req, res) => {
  const username = req.body.username;
  const token = generateToken(req.body.username);
  return res.status(200).json({ username, token });
});

app.get("/api/users", validateToken, (_, res) => res.json(USERS));

// Launch the http server
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));

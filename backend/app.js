const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookie = require("cookie");
const cookieParser = require("cookie-parser");
const { PORT, USERS } = require("./utils");
const { generateToken, validateToken, EXPIRES_IN } = require("./token");

// Load config from .env file
dotenv.config();

const app = express();

// from one origin only, and pass Access-Control-Allow-Credentials to true
app.use(cors({ origin: "http://localhost:4000", credentials: true }));

// json body and cookie are used for all endpoints
app.use([express.json(), cookieParser()]);

const setCookie = (token, maxAge) =>
  cookie.serialize("token", token, {
    path: "/",
    sameSite: true,
    httpOnly: true,
    secure: false, // should be true with https
    maxAge: maxAge,
  });

// Endpoints
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username === "elie29" && password === "123456") {
    const token = generateToken(req.body.username);
    res.setHeader("Set-Cookie", setCookie(token, EXPIRES_IN));
    return res.status(200).json({ username });
  }
  res.setHeader("Set-Cookie", setCookie("", -1));
  return res.status(401).json("Invalid credentials");
});

// refresh token before expiration
app.post("/refresh", validateToken, (req, res) => {
  const username = req.body.username;
  const token = generateToken(req.body.username);
  res.setHeader("Set-Cookie", setCookie(token, EXPIRES_IN));
  return res.status(200).json({ username });
});

app.get("/api/users", validateToken, (_, res) => {
  return res.json(USERS);
});

// Launch the http server
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));

const jwt = require("jsonwebtoken");

const EXPIRES_IN = 300; // expires after 5 minutes (5 * 60 = 300s)

const generateToken = username => {
  return jwt.sign({ username }, process.env.TOKEN_SECRET, {
    algorithm: "HS512", // not all algorithms are supported
    expiresIn: EXPIRES_IN,
  });
};

// Middleware to verify token validity
const validateToken = (req, res, next) => {
  // Gather the jwt access token from the request header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json("Token required");
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    console.log(err, decoded);
    if (err) {
      return res.status(403).json("Invalid token");
    }
    next(); // pass the execution off to whatever request the client intended
  });
};

module.exports = { generateToken, validateToken, EXPIRES_IN };

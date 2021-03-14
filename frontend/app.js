const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 4000;

// Endpoints
app.get("/", (_, res) => {
  res.setHeader("Content-Type", "text/html");
  res.writeHead(200);
  res.end(fs.readFileSync(`${__dirname}/index.html`, "utf8"));
});

app.get("/main.js", (_, res) => {
  res.type(".js");
  res.writeHead(200);
  res.end(fs.readFileSync(`${__dirname}/main.js`, "utf8"));
});

// Launch the http server
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));

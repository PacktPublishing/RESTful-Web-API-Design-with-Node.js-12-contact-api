const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const axios = require("axios");

const PORT = process.env.PORT || 5000;
const API_SERVICE_DNS = process.env.API_SERVICE_DNS;
const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("short"));
app.use(express.urlencoded()); // put form data on req body
app.use(express.json());

// set template engine
app.set("view engine", "ejs");
// serve static files
app.use(express.static("public"));

app.get("/", (req, res) => {
  // get authorization header
  const authHeader = req.get("Authorization");

  if (!authHeader || !authHeader.includes("Bearer")) {
    return res.render("index", { auth: false, error: false });
  }

  const token = authHeader.split(" ")[1];

  return res.render("index", {
    token,
    error: false
  });
});

app.listen(PORT, () => {
  console.log(`Client server listening on port ${PORT}`);
});

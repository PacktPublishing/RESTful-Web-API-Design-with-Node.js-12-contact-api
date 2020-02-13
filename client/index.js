const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const axios = require("axios");

const PORT = process.env.PORT || 5000;
const API_SERVICE_DNS = process.env.API_SERVICE_DNS;
const API_SERVICE_PORT = process.env.API_SERVICE_PORT;
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

// handle sign in/up form submit responses
app.post("/", async (req, res, next) => {
  const token = req.query.token;

  if (!token) {
    return res.render("index", { auth: false, error: false });
  }

  try {
    const { data } = await axios.get(
      `http://${API_SERVICE_DNS}:${API_SERVICE_PORT}/api/v2/contacts?offset=1&limit=5`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const {
      docs: { data: contacts },
      totalDocs,
      page,
      totalPages,
      hasNextPage,
      nextPage,
      hasPrevPage,
      prevPage,
      pagingCounter
    } = data;

    return res.render("index", {
      token,
      contacts: contacts.map(ct => ct.data),
      auth: true,
      error: false
    });
  } catch (error) {
    next(error);
  }
});

app.post("/signup", async (req, res) => {
  const { firstname, lastname, email, password, phone } = req.body;

  const user = {
    firstName: firstname,
    lastName: lastname,
    primaryEmailAddress: email,
    primaryContactNumber: phone,
    credential: { password }
  };

  try {
    const {
      data: { token }
    } = await axios.post(
      `http://${API_SERVICE_DNS}:${API_SERVICE_PORT}/auth/sign-up`,
      user
    );

    res.redirect(308, `/?token=${token}`);
  } catch (error) {
    next(error);
  }
});

app.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const {
      data: { token }
    } = await axios.post(
      `http://${API_SERVICE_DNS}:${API_SERVICE_PORT}/auth/sign-in`,
      {
        email,
        password
      }
    );

    res.redirect(308, `/?token=${token}`);
  } catch (error) {
    next(error);
  }
});

app.post("/add-contact", async (req, res, next) => {
  const token = req.query.token;
  const { firstname, lastname, email, phone } = req.body;

  const contact = {
    firstName: firstname,
    lastName: lastname,
    primaryEmailAddress: email,
    primaryContactNumber: phone
  };

  try {
    const { data } = await axios.post(
      `http://${API_SERVICE_DNS}:${API_SERVICE_PORT}/api/v2/contacts`,
      contact,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    res.redirect(308, `/?token=${token}`);
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .render("index", { error: true, auth: false, errorMessage: err.message });
});

app.listen(PORT, () => {
  console.log(`Client server listening on port ${PORT}`);
});

const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const routes = require("./routes/api");

const app = express();

app.use("/avatars", express.static("public/avatars"));

const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use("/api", routes);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, _req, res, _next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;

const path = require("node:path");
// const crypto = require("node:crypto");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "tmp"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

module.exports = multer({ storage });

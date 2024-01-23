const express = require("express");
const router = express.Router();

const AuthController = require("../../controllers/users");
const authMiddleware = require("../../middlewares/auth");

const jsonParser = express.json();

router.post("/register", jsonParser, AuthController.register);
router.post("/login", jsonParser, AuthController.login);
router.post("/logout", authMiddleware, AuthController.logout);
router.get("/current", authMiddleware, AuthController.current);
router.patch("/", authMiddleware, AuthController.subscription);

module.exports = router;

const express = require("express");
const router = express.Router();

const AuthController = require("../../controllers/users");
const authMiddleware = require("../../middlewares/auth");
const uploadMiddleware = require("../../middlewares/upload");

const jsonParser = express.json();

router.post("/register", jsonParser, AuthController.register);

router.get("/verify/:verificationToken", AuthController.userVerification);
router.post("/verify", AuthController.userRetryVerification);

router.post("/login", jsonParser, AuthController.login);
router.post("/logout", authMiddleware, AuthController.logout);
router.get("/current", authMiddleware, AuthController.current);
router.patch("/", authMiddleware, AuthController.subscription);

router.patch(
  "/avatar",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  AuthController.upload
);

module.exports = router;

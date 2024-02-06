const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const fs = require("node:fs/promises");
const path = require("node:path");
const Jimp = require("jimp");
const sendEmail = require("../helpers/sendEmail");
const crypto = require("node:crypto");

const {
  userSchema,
  subscriptionSchema,
  verifyEmailSchema,
} = require("../models/joi");
const User = require("../models/user");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

async function register(req, res, next) {
  const { email, password } = req.body;

  try {
    const response = userSchema.validate(req.body, {
      abortEarly: false,
    });

    if (typeof response.error !== "undefined") {
      return res
        .status(400)
        .json({ message: response.error.details[0].message });
    }

    const user = await User.findOne({ email });

    if (user !== null) {
      return res.status(409).json({ message: "Email in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomUUID();

    await sendEmail({
      to: email,
      subject: "Verify email",
      html: `To confirm your registration please click on the <a href="http://localhost:3000/api/users/verify/${verificationToken}">link</a>`,
      text: `To confirm your registration please open the link http://localhost:3000/api/users/verify/${verificationToken}`,
    });

    const result = await User.create({
      email,
      verificationToken,
      avatarURL: gravatar.url(email, { protocol: "https" }),
      password: passwordHash,
    });

    res.status(201).json({
      user: { email: result.email, subscription: result.subscription },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;

  try {
    const response = userSchema.validate(req.body, {
      abortEarly: false,
    });

    if (typeof response.error !== "undefined") {
      return res
        .status(400)
        .json({ message: response.error.details[0].message });
    }

    const user = await User.findOne({ email });

    if (user === null) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch === false) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    if (user.verify === false) {
      return res.status(401).send({ message: "Your account is not verified" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: 600 * 600 } // "1h"
    );

    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function current(req, res, next) {
  try {
    const { email, subscription } = req.user;

    res.status(200).json({ email, subscription });
  } catch (error) {
    next(error);
  }
}

async function subscription(req, res, next) {
  try {
    const response = subscriptionSchema.validate(req.body, {
      abortEarly: false,
    });

    if (typeof response.error !== "undefined") {
      return res
        .status(400)
        .json({ message: response.error.details[0].message });
    }

    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    });

    if (user === null) {
      return res.status(404).json({ message: "Not authorized" });
    }

    res
      .status(200)
      .json({ email: user.email, subscription: user.subscription });
  } catch (error) {
    next(error);
  }
}

async function upload(req, res, next) {
  try {
    const { _id } = req.user;
    const { path: tempUpload, originalname } = req.file;
    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, filename);

    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);

    Jimp.read(resultUpload, (err, img) => {
      if (err) throw err;

      img
        .resize(250, 250) // resize
        .write(resultUpload); // save
    });

    const user = await User.findByIdAndUpdate(
      _id,
      { avatarURL },
      { new: true }
    );

    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).json({ avatarURL: user.avatarURL });
  } catch (error) {
    next(error);
  }
}

async function userVerification(req, res, next) {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken });

    if (user === null) {
      return res.status(404).json({ message: "Not found" });
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
}

async function userRetryVerification(req, res, next) {
  try {
    const { email } = req.body;

    const response = verifyEmailSchema.validate(req.body, {
      abortEarly: false,
    });

    if (typeof response.error !== "undefined") {
      return res
        .status(400)
        .json({ message: response.error.details[0].message });
    }

    const user = await User.findOne({ email });

    if (user === null) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify === true) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    await sendEmail({
      to: email,
      subject: "Verify email",
      html: `To confirm your registration please click on the <a href="http://localhost:3000/api/users/verify/${user.verificationToken}">link</a>`,
      text: `To confirm your registration please open the link http://localhost:3000/api/users/verify/${user.verificationToken}`,
    });

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  current,
  subscription,
  upload,
  userVerification,
  userRetryVerification,
};

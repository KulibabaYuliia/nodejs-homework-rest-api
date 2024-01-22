const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userSchema, subscriptionSchema } = require("../models/joi");

const User = require("../models/user");

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

    const result = await User.create({ email, password: passwordHash });

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

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: 600 * 600 } // "1h"
    );

    await User.findByIdAndUpdate(user._id, { token });

    res.json({
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

module.exports = { register, login, logout, current, subscription };

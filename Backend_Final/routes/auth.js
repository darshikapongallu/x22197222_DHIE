const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { check, validationResult } = require("express-validator");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password, role, otherFields } = req.body;

  try {
    if (!otherFields?.address) {
      return res.status(400).json({ message: "Address is Required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role,
      otherFields: otherFields,
    });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      "your_jwt_secret_key",
      { expiresIn: "1h" }
    );

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const payload = {
        user: {
          id: user.id,
          userType: user.role,
        },
      };

      jwt.sign(
        payload,
        "your_jwt_secret",
        { expiresIn: "240h" },
        (err, token) => {
          if (err) throw err;
          res.json({ token, userType: user.role });
        }
      );
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

module.exports = router;

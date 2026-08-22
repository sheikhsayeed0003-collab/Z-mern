const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { signToken, protect } = require("../middleware/auth");

const router = express.Router();

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    return false;
  }
  return true;
}

router.post(
  "/register",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").trim().notEmpty().withMessage("Phone is required"),
    body("address").trim().notEmpty().withMessage("Address is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      if (!validate(req, res)) return;
      const { firstName, lastName, email, phone, address, password } = req.body;
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        address,
        password,
        shippingAddresses: [
          {
            label: "Home",
            fullName: `${firstName} ${lastName}`,
            phone,
            addressLine: address,
            isDefault: true,
          },
        ],
      });
      const token = signToken(user);
      res.status(201).json({ token, user: user.toSafeJSON() });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      if (!validate(req, res)) return;
      const user = await User.findOne({ email: req.body.email.toLowerCase() });
      if (!user || !(await user.matchPassword(req.body.password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const token = signToken(user);
      res.json({ token, user: user.toSafeJSON() });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

module.exports = router;

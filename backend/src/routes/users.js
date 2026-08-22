const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/profile", protect, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

router.patch("/profile", protect, async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    if (firstName !== undefined) req.user.firstName = firstName;
    if (lastName !== undefined) req.user.lastName = lastName;
    if (phone !== undefined) req.user.phone = phone;
    if (address !== undefined) req.user.address = address;
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/addresses", protect, (req, res) => {
  res.json({ addresses: req.user.shippingAddresses });
});

router.post("/addresses", protect, async (req, res) => {
  try {
    const { label, fullName, phone, addressLine, city, isDefault } = req.body;
    if (!fullName || !phone || !addressLine) {
      return res.status(400).json({ message: "fullName, phone, addressLine required" });
    }
    if (isDefault) {
      req.user.shippingAddresses.forEach((a) => {
        a.isDefault = false;
      });
    }
    req.user.shippingAddresses.push({
      label: label || "Home",
      fullName,
      phone,
      addressLine,
      city: city || "",
      isDefault: Boolean(isDefault) || req.user.shippingAddresses.length === 0,
    });
    await req.user.save();
    res.status(201).json({ addresses: req.user.shippingAddresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/addresses/:id", protect, async (req, res) => {
  try {
    const addr = req.user.shippingAddresses.id(req.params.id);
    if (!addr) return res.status(404).json({ message: "Address not found" });
    const { label, fullName, phone, addressLine, city, isDefault } = req.body;
    if (label !== undefined) addr.label = label;
    if (fullName !== undefined) addr.fullName = fullName;
    if (phone !== undefined) addr.phone = phone;
    if (addressLine !== undefined) addr.addressLine = addressLine;
    if (city !== undefined) addr.city = city;
    if (isDefault) {
      req.user.shippingAddresses.forEach((a) => {
        a.isDefault = false;
      });
      addr.isDefault = true;
    }
    await req.user.save();
    res.json({ addresses: req.user.shippingAddresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/addresses/:id", protect, async (req, res) => {
  try {
    const addr = req.user.shippingAddresses.id(req.params.id);
    if (!addr) return res.status(404).json({ message: "Address not found" });
    addr.deleteOne();
    await req.user.save();
    res.json({ addresses: req.user.shippingAddresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

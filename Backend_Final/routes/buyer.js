const express = require("express");
const Report = require("../models/Report");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.user.id }, { password: 0 });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/allpatients", authMiddleware, async (req, res) => {
  try {
    const user = await User.find({ role: "patient" }, { password: 0 });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/available-reports", authMiddleware, async (req, res) => {
  try {
    const availableReports = await Report.find({ status: "available" });
    res.json(availableReports);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/purchased-reports", authMiddleware, async (req, res) => {
  try {
    const buyerId = req.user.user.id;
    const purchasedReports = await Report.find({
      buyer: buyerId,
      status: "sold",
    });
    res.json(purchasedReports);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/purchase-report/:id", authMiddleware, async (req, res) => {
  const reportId = req.params.id;
  const buyerId = req.user.user.id;

  try {
    const report = await Report.findOne({ _id: reportId, status: "available" });
    if (!report) {
      return res
        .status(404)
        .json({ message: "Report not found or already sold" });
    }

    report.status = "sold";
    report.buyer = buyerId;
    await report.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;

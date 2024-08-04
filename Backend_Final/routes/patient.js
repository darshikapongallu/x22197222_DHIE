const express = require("express");
const { check, validationResult } = require("express-validator");
const Report = require("../models/Report");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    console.log(req.user.user.id);
    const user = await User.findOne({ _id: req.user.user.id }, { password: 0 });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const patientId = req.user.user.id;

    const totalReports = await Report.countDocuments({ patient: patientId });
    const availableReports = await Report.countDocuments({
      patient: patientId,
      status: "available",
    });
    const soldReports = await Report.countDocuments({
      patient: patientId,
      status: "sold",
    });
    const totalRevenue = await Report.aggregate([
      { $match: { patient: patientId, status: "sold" } },
      { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
    ]);

    res.json({
      availableReports,
      totalReportsForSale: totalReports,
      totalReportsSold: soldReports,
      totalRevenue: totalRevenue[0]?.totalRevenue || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/reports", authMiddleware, async (req, res) => {
  try {
    const patientId = req.user.user.id;
    const reports = await Report.find({ patient: patientId });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/toggledocview", authMiddleware, async (req, res) => {
  const { report } = req.body;
  const reportDoc = await Report.findById(report?._id);
  if (!reportDoc) {
    return res.status(404).send("Report not found");
  }
  reportDoc.allowUploaderToView = !reportDoc.allowUploaderToView;
  await reportDoc.save();
  res.status(200).json({ success: true });
});

router.post("/togglesell", authMiddleware, async (req, res) => {
  const { report } = req.body;
  const reportDoc = await Report.findById(report?._id);
  if (!reportDoc) {
    return res.status(404).send("Report not found");
  }
  if (reportDoc.status == "unavailable") {
    reportDoc.status = "available";
  } else if (reportDoc.status == "available") {
    reportDoc.status = "unavailable";
  }

  await reportDoc.save();
  res.status(200).json({ success: true });
});

router.put(
  "/report/:id/price",
  [
    authMiddleware,
    check("price", "Price is required and must be a number").isNumeric(),
  ],
  async (req, res) => {
    const { price } = req.body;
    const reportId = req.params.id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const report = await Report.findOne({
        _id: reportId,
        patient: req.user.user.id,
      });
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      report.price = price;
      await report.save();

      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

router.delete("/report/:id", authMiddleware, async (req, res) => {
  const reportId = req.params.id;
  try {
    const report = await Report.findOne({ _id: reportId });
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    await Report.deleteOne({ _id: reportId });

    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;

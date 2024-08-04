const express = require("express");
const { check, validationResult } = require("express-validator");
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

router.get("/reports", authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.put(
  "/report",
  [
    authMiddleware,
    check("reportName", "Report name is required").not().isEmpty(),
    check("disease", "Disease is required").not().isEmpty(),
    check("date", "Date is required").isISO8601(),
    check("criticality", "Criticality is required").not().isEmpty(),
    check("link", "link is required").not().isEmpty(),
    check("enkey", "enkey is required").not().isEmpty(),
  ],
  async (req, res) => {
    const { reportName, disease, date, criticality, link, enkey, patientId } =
      req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const uploadedBy = req.user.user.id;
    try {
      const newReport = new Report({
        reportName,
        disease,
        date,
        criticality,
        patient: patientId,
        link,
        enkey,
        uploadedBy,
      });

      const report = await newReport.save();
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

module.exports = router;

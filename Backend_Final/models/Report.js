const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportName: {
      type: String,
      required: true,
    },
    disease: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    criticality: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: false,
      default: 0,
    },
    link: {
      type: String,
      required: true,
    },
    enkey: {
      type: String,
      required: true,
    },
    allowUploaderToView: {
      type: Boolean,
      default: false,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "sold", "unavailable"],
      default: "unavailable",
    },
    patient: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: String,
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;

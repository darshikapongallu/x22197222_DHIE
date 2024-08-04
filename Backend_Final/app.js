const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const patientRoutes = require("./routes/patient");
const buyerRoutes = require("./routes/buyer");
const doctorRoutes = require("./routes/doctor");
const fileRoutes = require("./routes/file");
const cors = require("cors");

const app = express();
const PORT = 4343;

app.use(express.json({ limit: "50mb" }));
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/file", fileRoutes);

mongoose
  .connect("mongodb://127.0.0.1:27017/medical_records_app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

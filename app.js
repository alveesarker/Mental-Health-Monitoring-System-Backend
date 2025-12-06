const express = require("express");
const cors = require("cors");

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const patientRoutes = require("./routes/patientRoutes");
const counsellorRoute = require("./routes/counsellorRoutes")
const sessionRoutes = require("./routes/sessionRoutes");
const dailyLogRoutes = require("./routes/dailyLogRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes")
app.use("/patients", patientRoutes);
app.use("/counsellor", counsellorRoute);
app.use("/sessions", sessionRoutes);
app.use("/daily-logs", dailyLogRoutes);
app.use("/recommendations", recommendationRoutes)


// Default route
app.get("/", (req, res) => res.send("Server is running"));

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));

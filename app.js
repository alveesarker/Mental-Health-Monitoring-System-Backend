
const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());


// Routes
const patientRoutes = require("./routes/patientRoutes");
const counsellorRoute = require("./routes/counsellorRoutes")
const sessionRoutes = require("./routes/sessionRoutes");
const dailyLogRoutes = require("./routes/dailyLogRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const crisisAlertRoutes = require("./routes/crisisAlertRoutes");
const authRoutes = require('./routes/authRoutes');
const progressRoute = require('./routes/progressRoutes');
const ratingRoutes = require("./routes/ratingRouter");
const questionRouter = require('./routes/questionRouter');
const emergencycontact = require('./routes/emergencyContactRoute');
const adminDashboardRouter = require('./routes/adminDashboardRouter');
const assignmentRoute = require('./routes/assignmentRoute');
const dRecommendationRouter = require('./routes/deliveredRecommendationAutoRoutes');
const questionRoutes = require('./routes/questionRoute');
app.use("/patients", patientRoutes);
app.use("/counsellor", counsellorRoute);
app.use("/sessions", sessionRoutes);
app.use("/daily-logs", dailyLogRoutes);
app.use("/recommendations", recommendationRoutes);
app.use("/analysis", analysisRoutes);
app.use("/crisisalerts", crisisAlertRoutes);
app.use("/progress", progressRoute);
app.use('/auth', authRoutes);
app.use("/ratings", ratingRoutes);
app.use("/questions", questionRouter);
app.use("/emergency-contact", emergencycontact);
app.use("/dashboard", adminDashboardRouter);
app.use("/assignment", assignmentRoute);
app.use("/d-reco", dRecommendationRouter);
app.use('/questions', questionRoutes);
//

app.get('/', (req, res) => res.json({ message: 'MHM API running' }));
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

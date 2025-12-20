const Assignment = require("../models/assignmentModel");

/* ================= GET ALL ASSIGNMENTS ================= */
exports.getAllAssignments = async (req, res) => {
  try {
    const data = await Assignment.getAll();
    res.json({ success: true, assignments: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= CREATE ASSIGNMENT ================= */
exports.createAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= UPDATE ASSIGNMENT ================= */
exports.updateAssignment = async (req, res) => {
  try {
    await Assignment.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= DELETE ASSIGNMENT ================= */
exports.deleteAssignment = async (req, res) => {
  try {
    await Assignment.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= GET PATIENTS AND COUNSELLORS FOR DROPDOWN ================= */
exports.getDropdownData = async (req, res) => {
  try {
    // Fetch patients first
    const patients = await Assignment.getAllPatientsName();

    // Then fetch counsellors
    const counsellors = await Assignment.getAllCounsellorsName();

    // Return both
    res.json({ success: true, patients, counsellors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

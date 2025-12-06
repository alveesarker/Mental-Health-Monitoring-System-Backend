const Patient = require("../models/patientModel");

// GET /patients
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.getAllPatients();

    // Format DOB to YYYY-MM-DD
    const formatted = patients.map((p) => ({
      ...p,
      dob: p.dob ? p.dob.toISOString().split("T")[0] : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.addPatients = async (req, res) => {
  try {
    const { name, email, dob, gender, contactNumber, city, street, postalCode } = req.body;

    if (!name || !email || !dob || !gender || !contactNumber || !city || !street || !postalCode) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newPatient = await Patient.addPatient({
      name,
      email,
      dob,
      gender,
      contactNumber,
      city,
      street,
      postalCode
    });

    // Format DOB before sending response
    const formattedPatient = {
      ...newPatient,
      dob: newPatient.dob ? new Date(newPatient.dob).toISOString().split("T")[0] : null,
    };

    res.status(201).json(formattedPatient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};




exports.updatePatient = async (req, res) => {
  try {
    const patientID = req.params.id;
    const {
      name,
      email,
      dob,
      gender,
      contactNumber,
      city,
      street,
      postalCode,
    } = req.body;

    // Fetch existing patient
    const existingPatients = await Patient.getPatientById(patientID);

    if (!existingPatients) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const existing = existingPatients;

    // Prepare updated fields, keep old values if empty
    const updatedPatient = {
      name: name || existing.name,
      email: email || existing.email,
      dob: dob || existing.dob,
      gender: gender || existing.gender,
      contactNumber: contactNumber || existing.contactNumber,
      city: city || existing.city,
      street: street || existing.street,
      postalCode: postalCode || existing.postalCode,
    };

    // Update patient in DB
    const result = await Patient.updatePatient(patientID, updatedPatient);

    // Format DOB before sending response
    const formattedPatient = {
      ...updatedPatient,
      dob: updatedPatient.dob ? new Date(updatedPatient.dob).toISOString().split("T")[0] : null,
    };

    res.json(formattedPatient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.fetchAllPatientsName = async (req, res) => {
  try {
    const patients = await Patient.getAllPatientsName();
    res.json({ success: true, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.deletePatient = async (req, res) => {
  try {
    const patientID = req.params.id;
    const deleted = await Patient.deletePatient(patientID);

    if (!deleted) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

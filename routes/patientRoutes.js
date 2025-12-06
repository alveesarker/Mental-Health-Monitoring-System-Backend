const express = require("express");
const router = express.Router();

// Make sure the relative path is correct
const patientController = require("../controllers/patientController");

router.get("/pname", patientController.fetchAllPatientsName);
router.get("/", patientController.getPatients);
router.post("/", patientController.addPatients);
router.put("/:id", patientController.updatePatient);
router.delete("/:id", patientController.deletePatient);



module.exports = router;

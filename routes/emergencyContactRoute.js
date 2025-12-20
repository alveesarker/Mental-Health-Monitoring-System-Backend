const express = require("express");
const router = express.Router();
const controller = require("../controllers/emergencyContactController");

// Contacts
router.get("/", controller.getAllContacts);
router.post("/", controller.createContact);
router.put("/:contactNumber/:patientID", controller.updateContact);
router.delete("/:contactNumber/:patientID", controller.deleteContact);

// Get all patients for dropdown
router.get("/patients", controller.getPatients);

module.exports = router;

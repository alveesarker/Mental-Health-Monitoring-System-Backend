const model = require("../models/emergencyContactModel");

// GET ALL CONTACTS
const getAllContacts = async (req, res) => {
    try {
        const contacts = await model.getAll();
        res.json(contacts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch contacts" });
    }
};

// GET ALL PATIENTS
const getPatients = async (req, res) => {
    try {
        const patients = await model.getAllPatients();
        res.json(patients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch patients" });
    }
};

// CREATE CONTACT
const createContact = async (req, res) => {
    try {
        const contact = req.body;
        const result = await model.create(contact);
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create contact" });
    }
};

// UPDATE CONTACT
const updateContact = async (req, res) => {
    try {
        const { contactNumber, patientID } = req.params;
        const contact = req.body;
        await model.update(contactNumber, patientID, contact);
        res.json({ message: "Contact updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update contact" });
    }
};

// DELETE CONTACT
const deleteContact = async (req, res) => {
    try {
        const { contactNumber, patientID } = req.params;
        await model.remove(contactNumber, patientID);
        res.json({ message: "Contact deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete contact" });
    }
};

module.exports = {
    getAllContacts,
    getPatients,
    createContact,
    updateContact,
    deleteContact,
};

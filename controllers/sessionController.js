const Session = require("../models/session");

const getSessions = async (req, res) => {
  try {
    const session = await Session.getAll();
    res.json(session);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const requestSession = async (req, res) => {
  try {
    const {
      patientID,
      counsellorID,
      sessionType,
      status
    } = req.body;

    // basic validation
    if (!patientID || !counsellorID || !sessionType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const result = await Session.request({
      patientID,
      counsellorID,
      sessionType,
      status: status || "Requested",
    });

    res.status(201).json({
      success: true,
      sessionID: result.sessionID,
    });
  } catch (err) {
    console.error("REQUEST SESSION ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


const createSession = async (req, res) => {
  try {
    const { sessionData, typeData, type } = req.body;

    const result = await Session.create(sessionData, typeData, type);

    res.json({ success: true, sessionID: result.sessionID });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const updateSession = async (req, res) => {
  try {
    const sessionID = req.params.id;
    const { sessionData, typeData, type } = req.body;

    await Session.update(sessionID, sessionData, typeData, type);

    res.json({ success: true, message: "Updated successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};


const fetchSessionDetails = async (req, res) => {
  try {
    const sessionID = req.params.id;

    const rows = await Session.getSessionDetailsByID(sessionID);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Session not found" });
    }

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllIDs = async (req, res) => {
  try {
    const sessions = await Session.getAllSessionID(); 
    const sessionIDs = sessions.map(s => s.sessionID.toString());
    res.json(sessionIDs);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};




const deleteSession = async (req, res) => {
  try {
    await Session.remove(req.params.id);
    res.json({ success: true, message: "dletee successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ================= GET PENDING SESSIONS FOR PATIENT ================= */
const getPendingSessionsByPatient = async (req, res) => {
  try {
    const { patientID } = req.params;

    if (!patientID) {
      return res.status(400).json({
        success: false,
        message: "patientID is required"
      });
    }

    const sessions =
      await Session.getPendingSessionsByPatientID(patientID);

    res.json({
      success: true,
      data: sessions
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
};

const getPendingSessionsByCounsellor = async (req, res) => {
  try {
    const { counsellorID } = req.params;
    if (!counsellorID) {
      return res.status(400).json({
        success: false,
        message: "counsellorID is required"
      });
    }

    const sessions =
      await Session.getPendingSessionsByCounsellorID(counsellorID);

    res.json({
      success: true,
      data: sessions
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
};

/* ================= GET ALL SESSIONS FOR PATIENT ================= */
const getAllSessionsByPatient = async (req, res) => {
  try {
    const { patientID } = req.params;

    if (!patientID) {
      return res.status(400).json({
        success: false,
        message: "patientID is required"
      });
    }

    const sessions =
      await Session.getAllSessionsByPatientID(patientID);

    res.json({
      success: true,
      data: sessions
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
};
/* ================= GET ALL SESSIONS FOR PATIENT ================= */
const getAllSessionsByCounsellor = async (req, res) => {
  try {
    const { counsellorID } = req.params;
    if (!counsellorID) {
      return res.status(400).json({
        success: false,
        message: "counsellorID is required"
      });
    }

    const sessions =
      await Session.getAllSessionsByCounsellorID(counsellorID);
    res.json({
      success: true,
      data: sessions
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
};



module.exports = {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  fetchSessionDetails,
  getAllIDs,
  getPendingSessionsByPatient,
  getAllSessionsByPatient,
  requestSession,
  getPendingSessionsByCounsellor,
  getAllSessionsByCounsellor
};

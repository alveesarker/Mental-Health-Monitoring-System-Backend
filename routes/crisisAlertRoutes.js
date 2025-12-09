const express = require("express");
const router = express.Router();
const controller = require("../controllers/crisisAlertController")

router.get("/", controller.getAlerts);
router.get("/:id", controller.getAlertById);
router.post("/", controller.createAlert);
router.put("/:id", controller.updateAlert);
router.delete("/:id", controller.deleteAlert);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("../controllers/counsellorController");


router.get("/cname", controller.fetchAllCounsellorsName);
// CREATE
router.post("/add", controller.createCounsellor);

// UPDATE
router.put("/update/:id", controller.updateCounsellor);

// DELETE
router.delete("/delete/:id", controller.deleteCounsellor);

// READ (main)
router.get("/main", controller.getMain);

// READ (details)
router.get("/details/:id", controller.getDetails);

module.exports = router;
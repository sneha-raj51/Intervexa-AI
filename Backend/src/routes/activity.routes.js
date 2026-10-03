const express = require("express");
const activityController = require("../controllers/activity.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware.authUser);

router.get("/", activityController.getActivities);

module.exports = router;

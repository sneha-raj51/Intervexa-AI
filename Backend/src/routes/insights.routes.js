const express = require("express");
const insightsController = require("../controllers/insights.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware.authUser);

router.get("/", insightsController.getInsights);

module.exports = router;

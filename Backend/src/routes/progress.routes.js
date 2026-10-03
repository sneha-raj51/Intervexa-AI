const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const progressController = require("../controllers/progress.controller");

const progressRouter = express.Router();

progressRouter.get("/readiness", authMiddleware.authUser, progressController.getReadinessData);

module.exports = progressRouter;

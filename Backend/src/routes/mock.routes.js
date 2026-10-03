const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const mockController = require("../controllers/mock.controller");

const mockRouter = express.Router();

mockRouter.post("/setup", authMiddleware.authUser, mockController.setupInterview);
mockRouter.post("/:interviewId/answer", authMiddleware.authUser, mockController.submitAnswer);
mockRouter.post("/:interviewId/complete", authMiddleware.authUser, mockController.completeInterview);
mockRouter.get("/:interviewId", authMiddleware.authUser, mockController.getInterviewById);

module.exports = mockRouter;

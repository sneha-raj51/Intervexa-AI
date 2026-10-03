const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const practiceController = require("../controllers/practice.controller");

const practiceRouter = express.Router();

practiceRouter.get("/", authMiddleware.authUser, practiceController.getPracticeQuestions);
practiceRouter.get("/weak-areas", authMiddleware.authUser, practiceController.getWeakAreas);
practiceRouter.patch("/:id", authMiddleware.authUser, practiceController.updateQuestionStatus);
practiceRouter.post("/:id/answer", authMiddleware.authUser, practiceController.submitPracticeAnswer);

module.exports = practiceRouter;

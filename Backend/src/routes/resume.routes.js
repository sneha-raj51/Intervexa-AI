const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const resumeController = require("../controllers/resume.controller")
const upload = require("../middlewares/file.middleware")

const resumeRouter = express.Router()

/**
 * @route POST /api/resume/analyze
 * @description Analyze resume and optional JD
 * @access private
 */
resumeRouter.post("/analyze", authMiddleware.authUser, upload.single("resume"), resumeController.analyzeResumeController)

/**
 * @route GET /api/resume/
 * @description Get all resume analyses for logged in user
 * @access private
 */
resumeRouter.get("/", authMiddleware.authUser, resumeController.getResumeAnalysesController)

/**
 * @route GET /api/resume/:analysisId
 * @description Get a specific resume analysis
 * @access private
 */
resumeRouter.get("/:analysisId", authMiddleware.authUser, resumeController.getResumeAnalysisByIdController)

module.exports = resumeRouter

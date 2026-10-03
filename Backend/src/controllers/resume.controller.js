const pdfParse = require("pdf-parse")
const { analyzeResume } = require("../services/ai.service")
const resumeAnalysisModel = require("../models/resumeAnalysis.model")

const analyzeResumeController = async (req, res, next) => {
    try {
        const resumeFile = req.file
        let { jobDescription, jobId } = req.body
        if (jobDescription === "undefined") jobDescription = "";

        if (!resumeFile) {
            return res.status(400).json({ message: "Resume file is required" })
        }

        const resumePdfData = await (new pdfParse.PDFParse(Uint8Array.from(resumeFile.buffer))).getText()
        const resumeText = resumePdfData.text

        const analysisData = await analyzeResume({ 
            resume: resumeText, 
            jobDescription: jobDescription || "" 
        })

        const newAnalysis = new resumeAnalysisModel({
            user: req.user.id,
            resumeText,
            jobDescriptionText: jobDescription || "",
            jobId: jobId || undefined,
            ...analysisData
        })

        await newAnalysis.save()

        res.status(201).json({
            message: "Resume analyzed successfully",
            analysis: newAnalysis
        })

    } catch (error) {
        next(error)
    }
}

const getResumeAnalysesController = async (req, res, next) => {
    try {
        const analyses = await resumeAnalysisModel.find({ user: req.user.id }).sort({ createdAt: -1 })
        res.status(200).json({
            message: "Resume analyses fetched successfully",
            analyses
        })
    } catch (error) {
        next(error)
    }
}

const getResumeAnalysisByIdController = async (req, res, next) => {
    try {
        const { analysisId } = req.params
        const analysis = await resumeAnalysisModel.findOne({ _id: analysisId, user: req.user.id })
        
        if (!analysis) {
            return res.status(404).json({ message: "Resume analysis not found" })
        }

        res.status(200).json({
            message: "Resume analysis fetched successfully",
            analysis
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    analyzeResumeController,
    getResumeAnalysesController,
    getResumeAnalysisByIdController
}

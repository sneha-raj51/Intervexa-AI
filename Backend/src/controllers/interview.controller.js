const pdfParse = require("pdf-parse")
const { generateInterviewReport } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const Notification = require("../models/notification.model");
const Activity = require("../models/activity.model");




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

    let resumeText = "";
    if (req.file) {
        const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
        resumeText = resumeContent.text;
    }

    let { selfDescription, jobDescription, jobId } = req.body

    if (selfDescription === "undefined") selfDescription = "";
    if (jobDescription === "undefined") jobDescription = "";

    if (!resumeText && !selfDescription) {
        return res.status(400).json({ message: "Either a Resume or a Self Description is required." });
    }

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeText,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeText,
        selfDescription,
        jobDescription,
        jobId: jobId || undefined,
        ...interViewReportByAi
    })

    // Sync questions to Practice Hub
    try {
        const PracticeQuestion = require("../models/practiceQuestion.model");
        const practiceDocs = [];
        
        if (interViewReportByAi.technicalQuestions) {
            interViewReportByAi.technicalQuestions.forEach(q => {
                practiceDocs.push({
                    user: req.user.id,
                    question: q.question,
                    category: "Technical",
                    difficulty: "Intermediate",
                    intention: q.intention,
                    source: "Interview Analysis",
                    sourceId: interviewReport._id,
                    jobId: jobId || undefined
                });
            });
        }
        
        if (interViewReportByAi.behavioralQuestions) {
            interViewReportByAi.behavioralQuestions.forEach(q => {
                practiceDocs.push({
                    user: req.user.id,
                    question: q.question,
                    category: "Behavioral",
                    difficulty: "Intermediate",
                    intention: q.intention,
                    source: "Interview Analysis",
                    sourceId: interviewReport._id,
                    jobId: jobId || undefined
                });
            });
        }
        
        if (practiceDocs.length > 0) {
            await PracticeQuestion.insertMany(practiceDocs, { ordered: false }).catch(err => {
                // Ignore duplicate key errors silently since we want unique questions
                console.log("Some practice questions were duplicates and skipped.");
            });
        }
    } catch (syncErr) {
        console.error("Failed to sync practice questions:", syncErr);
    }

    try {
        await Activity.create({
            user: req.user.id,
            type: "INTERVIEW_GENERATED",
            title: "Interview Generated",
            description: "A new interview analysis report was generated.",
            relatedEntityType: "InterviewReport",
            relatedEntityId: interviewReport._id
        });
        await Notification.create({
            user: req.user.id,
            type: "INTERVIEW",
            title: "Analysis Ready",
            message: "Your new interview analysis report is ready.",
            relatedEntityType: "InterviewReport",
            relatedEntityId: interviewReport._id
        });
    } catch (err) {
        console.error("Failed to create activity/notification:", err);
    }

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })

}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController }
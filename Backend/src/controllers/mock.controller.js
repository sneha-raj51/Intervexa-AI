const MockInterview = require("../models/mockInterview.model");
const InterviewReport = require("../models/interviewReport.model");
const { generateMockQuestions, evaluateMockAnswer } = require("../services/ai.service");
const Notification = require("../models/notification.model");
const Activity = require("../models/activity.model");

exports.setupInterview = async (req, res) => {
    try {
        const { type, difficulty, questionCount, isTimed, jobId } = req.body;
        
        // Fetch context from latest report
        let query = { user: req.user.id };
        if (jobId) query.jobId = jobId;
        const latestReport = await InterviewReport.findOne(query).sort({ createdAt: -1 });
        
        let jobDescription = "";
        let resume = "";
        let skillGapsStr = "";
        let jobTitle = "General Role";

        if (latestReport) {
            jobDescription = latestReport.jobDescription || "";
            resume = latestReport.resume || "";
            jobTitle = latestReport.title || "General Role";
            if (latestReport.skillGaps && latestReport.skillGaps.length > 0) {
                skillGapsStr = latestReport.skillGaps.map(g => `${g.skill} (${g.severity})`).join(", ");
            }
        }

        const aiResponse = await generateMockQuestions({
            type, difficulty, questionCount, jobDescription, resume, skillGaps: skillGapsStr
        });

        const newInterview = new MockInterview({
            user: req.user.id,
            type,
            difficulty,
            questionCount,
            isTimed,
            questions: aiResponse.questions,
            context: {
                jobTitle,
                hasResume: !!resume
            },
            jobId: jobId || undefined
        });

        await newInterview.save();

        // Sync questions to Practice Hub
        try {
            const PracticeQuestion = require("../models/practiceQuestion.model");
            const practiceDocs = aiResponse.questions.map(q => ({
                user: req.user.id,
                question: q.question,
                category: q.category,
                difficulty: q.difficulty,
                intention: q.intention,
                source: "Mock Interview",
                sourceId: newInterview._id,
                jobId: jobId || undefined
            }));
            
            if (practiceDocs.length > 0) {
                await PracticeQuestion.insertMany(practiceDocs, { ordered: false }).catch(err => {
                    console.log("Some mock questions were duplicates and skipped.");
                });
            }
        } catch (syncErr) {
            console.error("Failed to sync mock questions:", syncErr);
        }

        res.status(201).json({ interview: newInterview });
    } catch (error) {
        console.error("Error setting up mock interview:", error);
        res.status(500).json({ message: "Failed to setup interview. Please try again." });
    }
};

exports.submitAnswer = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { questionIndex, userAnswer } = req.body;

        const interview = await MockInterview.findOne({ _id: interviewId, user: req.user.id });
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        const questionObj = interview.questions[questionIndex];
        if (!questionObj) {
            return res.status(400).json({ message: "Invalid question index" });
        }

        const evaluation = await evaluateMockAnswer({
            question: questionObj.question,
            category: questionObj.category,
            userAnswer
        });

        // Check if answer already exists for this index to support retry, or just push
        const existingAnswerIndex = interview.answers.findIndex(a => a.questionIndex === questionIndex);
        
        const answerData = { questionIndex, userAnswer, evaluation };

        if (existingAnswerIndex !== -1) {
            interview.answers[existingAnswerIndex] = answerData;
        } else {
            interview.answers.push(answerData);
        }

        await interview.save();
        res.status(200).json({ evaluation });
    } catch (error) {
        console.error("Error evaluating answer:", error);
        res.status(500).json({ message: "Failed to evaluate answer." });
    }
};

exports.completeInterview = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { completedTime } = req.body; // from frontend timer

        const interview = await MockInterview.findOneAndUpdate(
            { _id: interviewId, user: req.user.id },
            { status: "Completed", completedTime: completedTime || 0 },
            { new: true }
        );

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        try {
            await Activity.create({
                user: req.user.id,
                type: "MOCK_COMPLETED",
                title: "Mock Interview Completed",
                description: `Completed a ${interview.difficulty} ${interview.type} mock interview.`,
                relatedEntityType: "MockInterview",
                relatedEntityId: interview._id
            });
            await Notification.create({
                user: req.user.id,
                type: "PRACTICE",
                title: "Mock Completed",
                message: "You have successfully completed a mock interview session.",
                relatedEntityType: "MockInterview",
                relatedEntityId: interview._id
            });
        } catch (err) {
            console.error("Failed to create activity/notification:", err);
        }

        res.status(200).json({ interview });
    } catch (error) {
        console.error("Error completing interview:", error);
        res.status(500).json({ message: "Failed to complete interview." });
    }
};

exports.getInterviewById = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const interview = await MockInterview.findOne({ _id: interviewId, user: req.user.id });
        
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        res.status(200).json({ interview });
    } catch (error) {
        console.error("Error fetching mock interview:", error);
        res.status(500).json({ message: "Failed to fetch interview." });
    }
};

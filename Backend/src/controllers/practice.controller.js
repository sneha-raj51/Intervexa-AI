const PracticeQuestion = require("../models/practiceQuestion.model");
const { evaluateMockAnswer } = require("../services/ai.service");

exports.getPracticeQuestions = async (req, res) => {
    try {
        const { search, category, difficulty, status, skill } = req.query;
        
        let query = { user: req.user._id };

        if (search) {
            query.question = { $regex: search, $options: "i" };
        }
        if (category && category !== "All") query.category = category;
        if (difficulty && difficulty !== "All") query.difficulty = difficulty;
        if (status && status !== "All") {
            if (status === "Bookmarked") {
                query.isBookmarked = true;
            } else {
                query.status = status;
            }
        }
        if (skill && skill !== "All") query.skill = skill;

        const questions = await PracticeQuestion.find(query).sort({ createdAt: -1 });
        
        res.status(200).json({ questions });
    } catch (error) {
        console.error("Error fetching practice questions:", error);
        res.status(500).json({ message: "Failed to fetch practice questions." });
    }
};

exports.updateQuestionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body; // e.g. { isBookmarked: true } or { status: "Needs Review" }

        const question = await PracticeQuestion.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { $set: updateData },
            { new: true }
        );

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.status(200).json({ question });
    } catch (error) {
        console.error("Error updating question status:", error);
        res.status(500).json({ message: "Failed to update question status." });
    }
};

exports.submitPracticeAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const { userAnswer } = req.body;

        const question = await PracticeQuestion.findOne({ _id: id, user: req.user._id });
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        const evaluation = await evaluateMockAnswer({
            question: question.question,
            category: question.category,
            userAnswer
        });

        // Auto-assign status based on evaluation. This is a simple heuristic:
        let newStatus = "Practiced";
        // If it's a behavioral question and any STAR is missing or warning
        if (question.category === "Behavioral" && evaluation.star) {
            const values = Object.values(evaluation.star);
            if (values.includes("✕") || values.includes("⚠")) {
                newStatus = "Needs Review";
            }
        }
        // Could also parse "whatToImprove" length, but we keep it simple here.

        question.status = newStatus;
        question.attempts.push({ answer: userAnswer, evaluation });
        
        await question.save();

        res.status(200).json({ question, evaluation });
    } catch (error) {
        console.error("Error evaluating practice answer:", error);
        res.status(500).json({ message: "Failed to evaluate answer." });
    }
};

exports.getWeakAreas = async (req, res) => {
    try {
        // Find questions that need review
        const weakQuestions = await PracticeQuestion.find({ user: req.user._id, status: "Needs Review" });
        
        // Group by skill/category
        const weakAreas = [];
        const groups = {};

        weakQuestions.forEach(q => {
            const key = q.skill || q.category;
            if (!groups[key]) groups[key] = { name: key, questions: [], count: 0 };
            groups[key].questions.push(q);
            groups[key].count++;
        });

        for (const key in groups) {
            if (groups[key].count > 0) {
                weakAreas.push({
                    area: key,
                    reason: `Several recent questions involving ${key} were marked as needing improvement.`,
                    relatedQuestionsCount: groups[key].count
                });
            }
        }

        res.status(200).json({ weakAreas });
    } catch (error) {
        console.error("Error fetching weak areas:", error);
        res.status(500).json({ message: "Failed to fetch weak areas." });
    }
};

const mongoose = require('mongoose');

const mockQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    category: { type: String, enum: ["Technical", "Behavioral"], required: true },
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    intention: { type: String }
}, { _id: false });

const mockEvaluationSchema = new mongoose.Schema({
    whatYouDidWell: { type: String },
    whatToImprove: { type: String },
    exampleDirection: { type: String },
    star: {
        situation: { type: String, enum: ["✓", "✕", "⚠", "N/A"] },
        task: { type: String, enum: ["✓", "✕", "⚠", "N/A"] },
        action: { type: String, enum: ["✓", "✕", "⚠", "N/A"] },
        result: { type: String, enum: ["✓", "✕", "⚠", "N/A"] }
    }
}, { _id: false });

const mockAnswerSchema = new mongoose.Schema({
    questionIndex: { type: Number, required: true },
    userAnswer: { type: String, required: true },
    evaluation: { type: mockEvaluationSchema, required: true }
}, { _id: false });

const mockInterviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    type: { type: String, enum: ["Technical", "Behavioral", "Mixed"], required: true },
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    questionCount: { type: Number, required: true },
    isTimed: { type: Boolean, default: false },
    status: { type: String, enum: ["InProgress", "Completed"], default: "InProgress" },
    questions: [mockQuestionSchema],
    answers: [mockAnswerSchema],
    completedTime: { type: Number, default: 0 }, // in seconds
    context: {
        jobTitle: { type: String, default: "General Role" },
        hasResume: { type: Boolean, default: false }
    },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' }
}, { timestamps: true });

const mockInterviewModel = mongoose.model("MockInterview", mockInterviewSchema);
module.exports = mockInterviewModel;

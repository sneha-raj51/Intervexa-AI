const mongoose = require('mongoose');

const practiceAttemptSchema = new mongoose.Schema({
    answer: { type: String, required: true },
    evaluation: { type: mongoose.Schema.Types.Mixed, required: true }, // The returned object from evaluateMockAnswer
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const practiceQuestionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    question: { type: String, required: true },
    category: { type: String, enum: ["Technical", "Behavioral", "Mixed"], required: true },
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Intermediate" },
    skill: { type: String, default: "General" }, // For grouping and filtering
    intention: { type: String }, // "Guidance"
    source: { type: String }, // e.g. "Interview Analysis", "Mock Interview"
    sourceId: { type: mongoose.Schema.Types.ObjectId }, // The Report or Mock ID
    isBookmarked: { type: Boolean, default: false },
    status: { type: String, enum: ["Not Practiced", "Practiced", "Needs Review"], default: "Not Practiced" },
    attempts: [practiceAttemptSchema],
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' }
}, { timestamps: true });

// Prevent exact duplicate questions for the same user (though slightly different text might slip through, this handles exact repeats)
practiceQuestionSchema.index({ user: 1, question: 1 }, { unique: true });

const practiceQuestionModel = mongoose.model("PracticeQuestion", practiceQuestionSchema);
module.exports = practiceQuestionModel;

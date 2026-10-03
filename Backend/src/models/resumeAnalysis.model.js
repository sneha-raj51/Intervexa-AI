const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    resumeText: {
        type: String,
        required: [true, "Resume text is required"]
    },
    jobDescriptionText: {
        type: String,
        default: ""
    },
    score: {
        atsCompatibility: Number,
        contentStrength: Number,
        skillsCoverage: Number
    },
    breakdown: {
        strengths: [String],
        needsAttention: [String],
        missing: [String]
    },
    sectionAnalysis: {
        summary: {
            status: String,
            observations: String,
            suggestions: String
        },
        experience: {
            status: String,
            observations: String,
            suggestions: String
        },
        projects: {
            status: String,
            observations: String,
            suggestions: String
        },
        education: {
            status: String,
            observations: String,
            suggestions: String
        },
        certifications: {
            status: String,
            observations: String,
            suggestions: String
        },
        skills: {
            status: String,
            observations: String,
            suggestions: String
        }
    },
    jdIntelligence: {
        requiredSkills: [String],
        preferredSkills: [String],
        responsibilities: [String],
        qualifications: [String]
    },
    matchBreakdown: {
        matchedSkills: [String],
        partialSkills: [String],
        missingSkills: [String],
        overallMatch: Number
    },
    recommendations: [String],
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobApplication'
    }
}, {
    timestamps: true
});

const resumeAnalysisModel = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);

module.exports = resumeAnalysisModel;

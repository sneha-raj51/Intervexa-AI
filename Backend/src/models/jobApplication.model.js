const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    title: {
        type: String,
        required: [true, "Job title is required"]
    },
    company: {
        type: String,
        required: [true, "Company name is required"]
    },
    description: {
        type: String,
        default: ""
    },
    url: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    employmentType: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract", "Freelance", "Internship", "Other"],
        default: "Full-time"
    },
    status: {
        type: String,
        enum: ["Saved", "Applied", "Assessment", "Interview", "Offer", "Rejected", "Withdrawn"],
        default: "Saved"
    },
    applicationDate: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: ""
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ResumeVersion"
    },
    timeline: [{
        status: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

const jobApplicationModel = mongoose.model("JobApplication", jobApplicationSchema);

module.exports = jobApplicationModel;

const mongoose = require('mongoose');

const resumeVersionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    name: {
        type: String,
        required: [true, "Resume name is required"]
    },
    targetRole: {
        type: String,
        default: ""
    },
    content: {
        type: String,
        required: [true, "Resume content is required"]
    },
    originalSourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ResumeVersion",
        default: null
    },
    status: {
        type: String,
        enum: ["Active", "Draft", "Archived"],
        default: "Active"
    }
}, {
    timestamps: true
});

const resumeVersionModel = mongoose.model("ResumeVersion", resumeVersionSchema);

module.exports = resumeVersionModel;

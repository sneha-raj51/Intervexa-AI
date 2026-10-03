const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    type: {
        type: String,
        enum: ["INTERVIEW", "PRACTICE", "JOB", "RESUME", "PROGRESS", "GENERAL"],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    relatedEntityType: {
        type: String, // e.g. 'JobApplication', 'InterviewReport'
    },
    relatedEntityId: {
        type: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Notification", notificationSchema);

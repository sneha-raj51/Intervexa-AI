const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    dueDate: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ["Practice", "Interview", "Application", "Resume", "General"],
        default: "General"
    },
    completed: {
        type: Boolean,
        default: false
    },
    relatedJobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobApplication"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Reminder", reminderSchema);

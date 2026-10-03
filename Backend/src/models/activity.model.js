const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    type: {
        type: String, // e.g., 'INTERVIEW_GENERATED', 'MOCK_COMPLETED', 'JOB_CREATED'
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    relatedEntityType: {
        type: String
    },
    relatedEntityId: {
        type: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Activity", activitySchema);

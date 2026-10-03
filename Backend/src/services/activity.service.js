const Activity = require("../models/activity.model");

exports.createActivity = async ({ user, type, title, description, relatedEntityType, relatedEntityId }) => {
    try {
        await Activity.create({ user, type, title, description, relatedEntityType, relatedEntityId });
    } catch (e) {
        console.error("Failed to create activity", e);
    }
};

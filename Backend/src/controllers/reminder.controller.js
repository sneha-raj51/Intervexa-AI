const Reminder = require("../models/reminder.model");

exports.getReminders = async (req, res) => {
    try {
        const reminders = await Reminder.find({ user: req.user._id }).sort({ dueDate: 1 });
        res.status(200).json(reminders);
    } catch (error) {
        console.error("Error getting reminders:", error);
        res.status(500).json({ message: "Failed to get reminders" });
    }
};

exports.createReminder = async (req, res) => {
    try {
        const { title, notes, dueDate, type, relatedJobId } = req.body;
        const reminder = new Reminder({
            user: req.user._id,
            title,
            notes,
            dueDate,
            type,
            relatedJobId: relatedJobId || undefined
        });
        await reminder.save();
        res.status(201).json(reminder);
    } catch (error) {
        console.error("Error creating reminder:", error);
        res.status(500).json({ message: "Failed to create reminder" });
    }
};

exports.updateReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!reminder) return res.status(404).json({ message: "Reminder not found" });
        res.status(200).json(reminder);
    } catch (error) {
        console.error("Error updating reminder:", error);
        res.status(500).json({ message: "Failed to update reminder" });
    }
};

exports.deleteReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!reminder) return res.status(404).json({ message: "Reminder not found" });
        res.status(200).json({ message: "Reminder deleted" });
    } catch (error) {
        console.error("Error deleting reminder:", error);
        res.status(500).json({ message: "Failed to delete reminder" });
    }
};

const Notification = require("../models/notification.model");

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error getting notifications:", error);
        res.status(500).json({ message: "Failed to get notifications" });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error getting unread count:", error);
        res.status(500).json({ message: "Failed to get unread count" });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: "Not found" });
        res.status(200).json(notification);
    } catch (error) {
        console.error("Error marking as read:", error);
        res.status(500).json({ message: "Failed to mark as read" });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all as read:", error);
        res.status(500).json({ message: "Failed to mark all as read" });
    }
};

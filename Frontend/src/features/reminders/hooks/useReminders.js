import { useState, useEffect } from "react";
import * as api from "../services/reminder.api";

export const useReminders = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReminders = async () => {
        try {
            setLoading(true);
            const data = await api.getReminders();
            setReminders(data);
        } catch (error) {
            console.error("Failed to fetch reminders", error);
        } finally {
            setLoading(false);
        }
    };

    const addReminder = async (data) => {
        try {
            const newReminder = await api.createReminder(data);
            setReminders(prev => [...prev, newReminder].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
            return newReminder;
        } catch (error) {
            console.error("Failed to add reminder", error);
            throw error;
        }
    };

    const editReminder = async (id, data) => {
        try {
            const updated = await api.updateReminder(id, data);
            setReminders(prev => prev.map(r => r._id === id ? updated : r));
            return updated;
        } catch (error) {
            console.error("Failed to edit reminder", error);
            throw error;
        }
    };

    const removeReminder = async (id) => {
        try {
            await api.deleteReminder(id);
            setReminders(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            console.error("Failed to delete reminder", error);
            throw error;
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    return { reminders, loading, addReminder, editReminder, removeReminder, refresh: fetchReminders };
};

import axios from "axios";
import { API_BASE_URL } from "../../../config/api";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getReminders = async () => {
    const response = await axios.get(`${API_BASE_URL}/reminders`, getAuthHeaders());
    return response.data;
};

export const createReminder = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/reminders`, data, getAuthHeaders());
    return response.data;
};

export const updateReminder = async (id, data) => {
    const response = await axios.patch(`${API_BASE_URL}/reminders/${id}`, data, getAuthHeaders());
    return response.data;
};

export const deleteReminder = async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/reminders/${id}`, getAuthHeaders());
    return response.data;
};

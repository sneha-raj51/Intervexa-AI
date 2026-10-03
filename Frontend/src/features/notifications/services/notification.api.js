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

export const getNotifications = async () => {
    const response = await axios.get(`${API_BASE_URL}/notifications`, getAuthHeaders());
    return response.data;
};

export const getUnreadCount = async () => {
    const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`, getAuthHeaders());
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await axios.patch(`${API_BASE_URL}/notifications/${id}/read`, {}, getAuthHeaders());
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await axios.patch(`${API_BASE_URL}/notifications/read-all`, {}, getAuthHeaders());
    return response.data;
};

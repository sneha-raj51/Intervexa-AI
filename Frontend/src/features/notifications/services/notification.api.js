import api from "../../../config/api";

export const getNotifications = async () => {
    const response = await api.get("/api/notifications");
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

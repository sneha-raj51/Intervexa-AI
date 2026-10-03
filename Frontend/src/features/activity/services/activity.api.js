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

export const getActivities = async () => {
    const response = await api.get("/api/activities");
    return response.data;
};

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

export const getCareerInsights = async (forceRefresh = false) => {
    const url = `${API_BASE_URL}/insights${forceRefresh ? "?forceRefresh=true" : ""}`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data;
};

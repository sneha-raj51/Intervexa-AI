import api from "../../../config/api";

export const getCareerInsights = async (forceRefresh = false) => {
    const url = `/api/insights${forceRefresh ? "?forceRefresh=true" : ""}`;
    const response = await api.get(url);
    return response.data;
};

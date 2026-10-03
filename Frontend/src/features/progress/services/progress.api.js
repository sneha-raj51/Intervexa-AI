import api from "../../../config/api";

export const getReadinessDataApi = async () => {
    const response = await api.get("/api/progress/readiness");
    return response.data;
};

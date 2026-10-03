import api from "../../../config/api";

export const getActivities = async () => {
    const response = await api.get("/api/activities");
    return response.data;
};

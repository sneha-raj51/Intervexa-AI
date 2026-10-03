import { useState, useEffect } from "react";
import * as api from "../services/activity.api";

export const useActivity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const data = await api.getActivities();
            setActivities(data);
        } catch (error) {
            console.error("Failed to fetch activities", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    return { activities, loading, refresh: fetchActivities };
};

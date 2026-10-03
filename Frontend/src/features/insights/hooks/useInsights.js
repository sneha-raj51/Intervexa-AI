import { useState, useEffect } from "react";
import * as api from "../services/insights.api";

export const useInsights = () => {
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInsights = async (forceRefresh = false) => {
        try {
            if (forceRefresh) setRefreshing(true);
            else setLoading(true);

            const data = await api.getCareerInsights(forceRefresh);
            setInsight(data);
        } catch (error) {
            console.error("Failed to fetch insights", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    return { insight, loading, refreshing, refreshInsights: () => fetchInsights(true) };
};

import { useState, useCallback } from "react";
import { getReadinessDataApi } from "../services/progress.api";

export const useProgress = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const fetchReadiness = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getReadinessDataApi();
            setData(result);
            return result;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to fetch progress data");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        data,
        fetchReadiness
    };
};

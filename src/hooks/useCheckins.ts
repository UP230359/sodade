import { useState, useEffect } from "react";
import { getCheckins, Checkin } from "@/lib/api";

export function useCheckins(userId: number) {
    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCheckins = async () => {
            try {
                const data = await getCheckins(userId);
                setCheckins(data);
            } catch (_err) {
                setError("Failed to load check-ins");
            } finally {
                setLoading(false);
            }
        };
        fetchCheckins();
    }, [userId]);

    return { checkins, loading, error };
}
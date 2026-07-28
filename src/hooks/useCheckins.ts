import { useState, useEffect, useCallback } from "react";
import { getCheckins, createCheckin, Checkin, NewCheckin } from "@/lib/api";

export function useCheckins(userId: number | null) {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckins = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCheckins(userId);
      setCheckins(data);
    } catch (err) {
      setError("Failed to load checkins");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  const addCheckin = async (checkin: NewCheckin) => {
    await createCheckin(checkin);
    await fetchCheckins();
  };

  return { checkins, loading, error, addCheckin };
}

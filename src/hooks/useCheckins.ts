import { useState, useEffect, useCallback } from "react";
import { getCheckins, createCheckin, Checkin, NewCheckin } from "@/lib/api";

/**
 * Hook que trae y mantiene sincronizada la lista de checkins de un usuario.
 * Se encarga de: pedir los datos al montar, exponer loading/error, y dar
 * una función `refetch` para volver a pedirlos (por ejemplo, después de
 * cerrar el modal de check-in, por si se creó uno nuevo).
 */
export function useCheckins(userId: number | null) {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const fetchCheckins = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCheckins(userId);
        if (isMounted) {
          setCheckins(data);
        }
      } catch {
        if (isMounted) {
          setError("No se pudieron cargar tus reflexiones. Intenta de nuevo.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCheckins();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCheckins(userId);
      setCheckins(data);
    } catch {
      setError("No se pudieron cargar tus reflexiones. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addCheckin = async (checkin: NewCheckin) => {
    await createCheckin(checkin);
    await refetch();
  };

  return { checkins, loading, error, addCheckin, refetch };
}

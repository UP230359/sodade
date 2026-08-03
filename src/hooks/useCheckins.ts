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

  const fetchCheckins = useCallback(async () => {
    if (!userId) return; // sin usuario logueado no hay nada que pedir
    setLoading(true);
    setError(null);
    try {
      const data = await getCheckins(userId); // GET /api/checkins?userId=...
      setCheckins(data);
    } catch {
      setError("No se pudieron cargar tus reflexiones. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Fetch de datos al montar / cuando cambia el usuario: patrón válido de
    // sincronizar con un sistema externo (la API). El setLoading(true) al
    // inicio de fetchCheckins dispara este warning, pero es un falso
    // positivo para este caso de uso (ver react.dev/learn/you-might-not-need-an-effect).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCheckins();
  }, [fetchCheckins]);

  const addCheckin = async (checkin: NewCheckin) => {
    await createCheckin(checkin);
    await fetchCheckins();
  };

  return { checkins, loading, error, addCheckin, refetch: fetchCheckins };
}

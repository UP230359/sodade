"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { setUser, setHydrated } from "@/store/userSlice";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Estado local para saber si ya leímos localStorage por completo
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sodade_user");

      // Verificamos que exista y no sea un string corrupto ("undefined" o "null")
      if (stored && stored !== "undefined" && stored !== "null") {
        const parsedUser = JSON.parse(stored);
        store.dispatch(setUser(parsedUser));
      }
    } catch (e) {
      console.error("Error reading user from localStorage:", e);
      // Si hay error al parsear, limpiamos la basura para evitar futuros crasheos
      localStorage.removeItem("sodade_user");
    } finally {
      // Ya sea que haya usuario o no, marcamos Redux como hidratado
      store.dispatch(setHydrated());
      // Le decimos a React que ya es seguro renderizar el resto de la app
      setIsReady(true);
    }
  }, []);

  // MIENTRAS leemos localStorage, no renderizamos NADA.
  // Esto mata por completo el bug que te mandaba al login al refrescar,
  // porque AppLayout no existe hasta que Redux ya tiene al usuario cargado.
  // También previene errores de hidratación entre el servidor y el cliente.
  if (!isReady) {
    return null;
  }

  return <Provider store={store}>{children}</Provider>;
}

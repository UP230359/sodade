"use client";
import { useAppSelector } from "@/store";

// Hook centralizado para acceder al usuario autenticado y su estado de sesión
// desde cualquier componente, sin repetir useAppSelector en cada uno.
export const useAuth = () => {
  const user = useAppSelector((state) => state.user.user);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const isOnboarded = useAppSelector((state) => state.user.isOnboarded);

  return { user, isAuthenticated, isOnboarded };
};

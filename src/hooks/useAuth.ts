"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setUser } from "@/store/userSlice";
import { getCurrentUser } from "@/lib/api";

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((state) => state.user);

    useEffect(() => {
        if (user) return;

        getCurrentUser()
            .then(({ user }) => {
                if (user) dispatch(setUser(user));
            })
            .catch(() => {
                // No hay sesión activa; se queda como no autenticado
            });
    }, [dispatch, user]);

    return { user, isAuthenticated };
};
import { configureStore } from "@reduxjs/toolkit";
import moodReducer from "./moodSlice";
import userReducer from "./userSlice";
import journalReducer from "./journalSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    mood: moodReducer,
    user: userReducer,
    journal: journalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

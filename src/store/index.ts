import { configureStore } from "@reduxjs/toolkit";
import moodReducer from "./moodSlice";
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    mood: moodReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

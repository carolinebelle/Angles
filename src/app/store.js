import { HowToReg } from "@mui/icons-material";
import { configureStore } from "@reduxjs/toolkit";
import landmarksReducer from "../features/landmarks/landmarks-slice";

export const store = configureStore({
  reducer: {
    landmarks: landmarksReducer,
  },
});

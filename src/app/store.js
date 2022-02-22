import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth-slice";
import { composeWithDevTools } from "redux-devtools-extension";

export const store = configureStore(
  {
    reducer: {
      auth: authReducer,
    },
  },
  composeWithDevTools()
);

import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../features";
import { composeWithDevTools } from "redux-devtools-extension";

export const store = configureStore(
  {
    reducer: {
      auth: authReducer,
    },
  },
  composeWithDevTools()
);

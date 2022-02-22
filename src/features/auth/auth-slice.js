// DUCKS pattern
import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state = action.payload;
    },
    logout(state) {
      state = null;
    },
  },
});

const { actions, reducer } = authSlice;

export const { login, logout } = actions;

export default reducer;

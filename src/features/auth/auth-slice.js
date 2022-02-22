// DUCKS pattern
import { createSlice } from "@reduxjs/toolkit";

const initialState = { value: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.value = action.payload;
    },
    logout(state) {
      state.value = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;

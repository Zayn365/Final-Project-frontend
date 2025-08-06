import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pass: "",
};

const personalSlice = createSlice({
  name: "personal",
  initialState,
  reducers: {
    addPass: (state, action) => {
      state.pass = action.payload;
    },
    removePass: () => initialState,
  },
});

export const { addPass, removePass } = personalSlice.actions;
export default personalSlice.reducer;

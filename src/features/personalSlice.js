import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pass: "",
  sizes: [],
};

const personalSlice = createSlice({
  name: "personal",
  initialState,
  reducers: {
    addPass: (state, action) => {
      state.pass = action.payload;
    },
    removePass: () => initialState,
    addSizes: (state, action) => {
      state.sizes = action.payload;
    },
  },
});

export const { addPass, removePass, addSizes } = personalSlice.actions;
export default personalSlice.reducer;

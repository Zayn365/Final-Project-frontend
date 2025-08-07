import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pass: "",
  sizes: [],
  sizeWithId: {},
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
    addSizeWithId: (state, action) => {
      state.sizeWithId = action.payload;
    },
  },
});

export const { addPass, removePass, addSizes, addSizeWithId } =
  personalSlice.actions;
export default personalSlice.reducer;

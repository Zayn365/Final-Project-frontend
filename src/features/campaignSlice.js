import { createSlice } from "@reduxjs/toolkit";
import appApi from "../services/appApi";

const initialState = [];

export const campaignSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    updateCampaigns: (_, action) => {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      appApi.endpoints.createCampaign.matchFulfilled,
      (_, { payload }) => payload
    );
    builder.addMatcher(
      appApi.endpoints.updateCampaign.matchFulfilled,
      (_, { payload }) => payload
    );
    builder.addMatcher(
      appApi.endpoints.deleteCampaign.matchFulfilled,
      (_, { payload }) => payload
    );
    builder.addMatcher(
      appApi.endpoints.getAllCampaigns.matchFulfilled,
      (_, { payload }) => payload
    );
    builder.addMatcher(
      appApi.endpoints.getCampaignById.matchFulfilled,
      (_, { payload }) => payload
    );
  },
});

export const { updateCampaigns } = campaignSlice.actions;
export default campaignSlice.reducer;

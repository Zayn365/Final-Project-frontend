import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// create the api

export const appApi = createApi({
  reducerPath: "appApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://final-project-backend-m9nb.onrender.com/",
  }),
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (user) => ({
        url: "/users/signup",
        method: "POST",
        body: user,
      }),
    }),

    login: builder.mutation({
      query: (user) => ({
        url: "/users/login",
        method: "POST",
        body: user,
      }),
    }),
    loginWithK12: builder.mutation({
      query: (user) => ({
        url: "/users/k12Login",
        method: "POST",
        body: user,
      }),
    }),
    // creating product
    createProduct: builder.mutation({
      query: (product) => ({
        url: "/products",
        body: product,
        method: "POST",
      }),
    }),

    deleteProduct: builder.mutation({
      query: ({ product_id, user_id }) => ({
        url: `/products/${product_id}`,
        body: {
          user_id,
        },
        method: "DELETE",
      }),
    }),

    updateProduct: builder.mutation({
      query: (product) => ({
        url: `/products/${product.id}`,
        body: product,
        method: "PATCH",
      }),
    }),

    // add to cart
    addToCart: builder.mutation({
      query: (cartInfo) => ({
        url: "/products/add-to-cart",
        body: cartInfo,
        method: "POST",
      }),
    }),
    // remove from cart
    removeFromCart: builder.mutation({
      query: (body) => ({
        url: "/products/remove-from-cart",
        body,
        method: "POST",
      }),
    }),

    // increase cart
    increaseCartProduct: builder.mutation({
      query: (body) => ({
        url: "/products/increase-cart",
        body,
        method: "POST",
      }),
    }),

    // decrease cart
    decreaseCartProduct: builder.mutation({
      query: (body) => ({
        url: "/products/decrease-cart",
        body,
        method: "POST",
      }),
    }),
    // create order
    createOrder: builder.mutation({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
    }),
    // 📦 campaigns
    createCampaign: builder.mutation({
      query: (campaign) => ({
        url: "/campaigns",
        method: "POST",
        body: campaign,
      }),
    }),
    getAllCampaigns: builder.query({
      query: () => ({
        url: "/campaigns",
        method: "GET",
      }),
    }),
    getCampaignById: builder.query({
      query: (id) => ({
        url: `/campaigns/single/${id}`,
        method: "GET",
      }),
    }),
    updateCampaign: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/campaigns/${id}`,
        method: "PUT",
        body: updates,
      }),
    }),
    deleteCampaign: builder.mutation({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useLoginWithK12Mutation,
  useCreateProductMutation,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useIncreaseCartProductMutation,
  useDecreaseCartProductMutation,
  useCreateOrderMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useCreateCampaignMutation,
  useGetAllCampaignsQuery,
  useGetCampaignByIdQuery,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} = appApi;

export default appApi;

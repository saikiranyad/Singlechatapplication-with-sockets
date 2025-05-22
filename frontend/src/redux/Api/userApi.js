// features/api/userApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {backendurl} from '../../Utils/Path'

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendurl}/api/user`,
    credentials: 'include' // send cookies for auth
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (formData) => ({
        url: '/sign',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    updateAccount: builder.mutation({
      query: (formData) => ({
        url: '/update',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),

    deleteAccount: builder.mutation({
      query: () => ({
        url: '/deleteaccount',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    getAllUsersExceptMe: builder.query({
      query: () => '/getallusers',
      providesTags: ['User'],
    }),

    getMe: builder.query({
      query: () => '/get',
      providesTags: ['User'],
    }),
  }),
})

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useGetAllUsersExceptMeQuery,
  useGetMeQuery
} = userApi

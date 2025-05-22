// src/redux/messageApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {backendurl} from '../../Utils/Path'

export const messageApi = createApi({
  reducerPath: 'messageApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${backendurl}/api/message`,
    credentials: 'include', 
  }),
  
  tagTypes: ['Message'],
  endpoints: (builder) => ({
    sendMessage: builder.mutation({
      query: (formData) => ({
        url: '/send',
        method: 'POST',
        body: formData, 
      }),
      invalidatesTags: ['Message'],
    }),

    getAllMessages: builder.query({
      query: (othersId) => `/getallmesssages/${othersId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.messages.map(({ _id }) => ({ type: 'Message', id: _id })),
              { type: 'Message', id: 'LIST' },
            ]
          : [{ type: 'Message', id: 'LIST' }],
    }),

    getMessageById: builder.query({
      query: (id) => `/getmessage/${id}`,
      providesTags: (result, error, id) => [{ type: 'Message', id }],
    }),

    deleteMessage: builder.mutation({
      query: (id) => ({
        url: `/deletemessage/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Message', id }],
    }),

    updateMessage: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/updatemessage/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Message', id }],
    }),

    markMessageAsRead: builder.query({
      query: (id) => `/readmessage/${id}`,
      // Optionally, invalidate or update cache here
      invalidatesTags: (result, error, id) => [{ type: 'Message', id }],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetAllMessagesQuery,
  useGetMessageByIdQuery,
  useDeleteMessageMutation,
  useUpdateMessageMutation,
  useMarkMessageAsReadQuery,
} = messageApi;

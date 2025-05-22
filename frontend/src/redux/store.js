// app/store.js
import { configureStore } from '@reduxjs/toolkit'
import { userApi } from './Api/userApi'
import { messageApi } from './Api/messageApi'

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware, messageApi.middleware),
    devTools: process.env.NODE_ENV !== 'production',
})
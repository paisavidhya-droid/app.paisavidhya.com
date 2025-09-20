// client/src/app/store.js

import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../app/slices/authSlice';
import { setupAxiosInterceptors } from "../api/axios";

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

setupAxiosInterceptors(store); 

export default store;
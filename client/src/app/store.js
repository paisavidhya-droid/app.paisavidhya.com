// client/src/app/store.js

import { configureStore } from "@reduxjs/toolkit";
import { setupAxiosInterceptors } from "../api/axios";
import authReducer from './slices/authSlice';
import userReducer from "./slices/userSlice";
import auditReducer from "./slices/auditSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
            users: userReducer,
        audit: auditReducer,
    },
});

setupAxiosInterceptors(store); 

export default store;
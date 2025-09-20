// main.jsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { store } from "./app/store.js";
import { setupAxiosInterceptors } from "./api/axios";
import { Provider } from "react-redux";
import AuthBootstrap from "./context/AuthBootstrap.jsx";
import { DeviceSizeProvider } from "./context/DeviceSizeContext.jsx";

setupAxiosInterceptors(store);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <DeviceSizeProvider>
          <AuthBootstrap />
          <App />
          <Toaster position="top-right" reverseOrder={false} />
        </DeviceSizeProvider>
      </BrowserRouter>{" "}
    </Provider>
  </StrictMode>
);

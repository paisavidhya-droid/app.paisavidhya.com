import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <BrowserRouter>
      <AuthProvider>
        <DeviceSizeProvider>
          <BrowserRouter> */}
            <App />
            {/* <Toaster position="top-right" /> global toaster */}
          {/* </BrowserRouter>
        </DeviceSizeProvider>
      </AuthProvider>
    </BrowserRouter> */}
  </StrictMode>
);

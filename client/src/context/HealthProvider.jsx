import { createContext, useContext } from "react";
import { useHealth as fetchHealth } from "../hooks/useHealth";

const HealthContext = createContext(null);

export function HealthProvider({ children }) {
  const healthState = fetchHealth(); 
  return (
    <HealthContext.Provider value={healthState}>
      {children}
    </HealthContext.Provider>
  );
}

// custom hook to consume context
export const useHealthContext = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error("useHealthContext must be used within HealthProvider");
  }
  return context;
};
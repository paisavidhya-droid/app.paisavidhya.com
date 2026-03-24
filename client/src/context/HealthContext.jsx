// E:\Storage\ekambram\project\client\src\context\HealthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const HealthContext = createContext(null);

export function HealthProvider({ children }) {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: "error" }));
  }, []);

  return (
    <HealthContext.Provider value={health}>
      {children}
    </HealthContext.Provider>
  );
}

export const useHealth = () => useContext(HealthContext);
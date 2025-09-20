// client\src\context\DeviceSizeContext.jsx

import React, { createContext, useState, useEffect } from 'react';

const DeviceSizeContext = createContext();

const DeviceSizeProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <DeviceSizeContext.Provider value={{ isMobile }}>
      {children}
    </DeviceSizeContext.Provider>
  );
};

export { DeviceSizeProvider, DeviceSizeContext };

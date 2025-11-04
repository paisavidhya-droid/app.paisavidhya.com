// client\src\context\DeviceSizeContext.jsx

import { useContext } from 'react';
import  { createContext, useState, useEffect } from 'react';

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

const useDeviceSize = () => useContext(DeviceSizeContext);

export { DeviceSizeProvider, useDeviceSize };

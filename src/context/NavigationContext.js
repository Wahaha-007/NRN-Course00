import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext(); // ตัวแผ่นกระดาษ Center

export const NavigationProvider = ({ children }) => { // ตัวเชื่อมการ Access กระดาษ
  const [navigationParams, setNavigationParams] = useState({});

  return (
    <NavigationContext.Provider value={{ navigationParams, setNavigationParams }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = () => useContext(NavigationContext);
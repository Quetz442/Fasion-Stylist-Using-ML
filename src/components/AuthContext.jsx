import React, { createContext, useContext, useState } from "react";
import axios from "axios";

// Set default Axios configuration
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://127.0.0.1:8000"; // Optional: Set a base URL for all requests

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
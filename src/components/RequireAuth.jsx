import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { validateUser } from "../api"; // Import the validateUser function with auth header
import { useAuth } from "./AuthContext";

const RequireAuth = ({ children }) => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        console.log("Validating user session..."); // Debugging
        const response = await validateUser();
        console.log("Validation response:", response); // Debugging
        if (response && response.authenticated) {
          setIsAuthenticated(true);
        } else {
          navigate("/Sign"); // Redirect to the login/signup page if not authenticated
        }
      } catch (err) {
        console.error("Validation error:", err.response?.data || err.message); // Debugging
        navigate("/Sign"); // Redirect to the login/signup page if an error occurs
      }
    };

    checkUserAuth();
  }, [navigate, setIsAuthenticated]);

  return isAuthenticated ? children : null; // Render children only if authenticated
};

export default RequireAuth;
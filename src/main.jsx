import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import App from "./App.jsx";
import FitRec from "./FitRec.jsx";
import Sign from "./loginsignup.jsx"; // Login/Signup page
import RequireAuth from "./components/RequireAuth.jsx"; // Import RequireAuth HOC
import { AuthProvider } from "./components/AuthContext"; // Import AuthProvider
import Profile from "./Profile.jsx"; // Profile page
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<App />} />
          <Route path="/Sign" element={<Sign />} />
          <Route path="/profile" element={<Profile />} />


          {/* Protected Route */}
          <Route
            path="/FitRec"
            element={
              <RequireAuth>
                <FitRec />
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);
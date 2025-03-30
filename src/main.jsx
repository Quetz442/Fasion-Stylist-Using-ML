import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import App from "./App.jsx";
import FitRec from "./FitRec.jsx"; // Move this import outside

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/FitRec" element={<FitRec />} /> {/* Add this route */}
      </Routes>
    </Router>
  </React.StrictMode>
);
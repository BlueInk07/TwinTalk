import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import FeaturesPage from "./pages/Featurespage.jsx";
import "./index.css";

/* ─── Simple auth guard ───
   Redirects to "/" if user is not in sessionStorage */
function ProtectedRoute({ children }) {
  const user = sessionStorage.getItem("twintalk_user");
  if (!user) return <Navigate to="/" replace />;
  return children;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Login / Sign-up page */}
        <Route path="/" element={<App />} />

        {/* Features page — only accessible after login */}
        <Route
          path="/features"
          element={
            <ProtectedRoute>
              <FeaturesPage />
            </ProtectedRoute>
          }
        />

        {/* Frontend-only preview route for design review without backend auth */}
        <Route path="/preview" element={<FeaturesPage />} />

        {/* Catch-all → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

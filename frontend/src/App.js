import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./registration/AuthPage";
import WishlistDashboard from "./wishlist/WishlistDashboard";
import WishlistPage from "./wishlist/WishlistPage";
import PublicWishlistPage from "./browsePage/PublicWishlistPage";

import ProtectedRoute from "./ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* AUTH */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* PRIVATE */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <WishlistDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wishlist/:id"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />

          {/* PUBLIC (но всё равно нужен токен, иначе нельзя бронировать/вносить) */}
          <Route
            path="/public/:login/:listId"
            element={
              <ProtectedRoute>
                <PublicWishlistPage />
              </ProtectedRoute>
            }
          />

          {/* DEFAULT */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

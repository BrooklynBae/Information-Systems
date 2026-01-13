import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./registration/AuthPage";
import WishlistDashboard from "./wishlist/WishlistDashboard";
import WishlistPage from "./wishlist/WishlistPage";
import PublicWishlistPage from "./browsePage/PublicWishlistPage"; // ✅ добавлено
import "./App.css";

function App() {
  const hasToken = !!localStorage.getItem("token");

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          <Route
            path="/dashboard"
            element={hasToken ? <WishlistDashboard /> : <Navigate to="/login" />}
          />

          <Route
            path="/wishlist/:id"
            element={hasToken ? <WishlistPage /> : <Navigate to="/login" />}
          />

          {/* ✅ Публичный просмотр (тоже под JWT на беке, поэтому без токена не пустим) */}
          <Route
            path="/public/:login/:listId"
            element={hasToken ? <PublicWishlistPage /> : <Navigate to="/login" />}
          />

          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

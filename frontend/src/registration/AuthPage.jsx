import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import "./Auth.css";

function AuthPage() {
  const [page, setPage] = useState("login");

  const handleAuth = (userData) => {
    // ты можешь редиректить как хочешь
    window.location.href = "/dashboard";
  };

  return (
    <div className="app">
      <main className="main-content">
        {page === "login" ? (
          <Login onAuth={handleAuth} setPage={setPage} />
        ) : (
          <Register onAuth={handleAuth} setPage={setPage} />
        )}
      </main>
    </div>
  );
}

export default AuthPage;

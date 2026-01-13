import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import "./Auth.css";

function AuthPage() {
  const [page, setPage] = useState("login");
  const navigate = useNavigate();

  const handleAuth = () => {
    navigate("/dashboard"); // ✅ без перезагрузки
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

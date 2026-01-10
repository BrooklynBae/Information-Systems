import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import "./Auth.css";

function AuthPage() {
    const [page, setPage] = useState("login");
    const [user, setUser] = useState(null);

    const handleAuth = (userData) => {
        localStorage.setItem("user", JSON.stringify(userData));
        window.location.href = '/dashboard';
    };


    if (user) {
        return (
            <div className="dashboard">
                <h1>Добро пожаловать, {user.login}!</h1>
                <p>{user.isRegistered ? "Вход выполнен" : "Регистрация успешна"}</p>
                <button onClick={() => { setUser(null); localStorage.removeItem("user"); }}>
                    Выйти
                </button>
            </div>
        );
    }

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

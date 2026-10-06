import React, { useState } from "react";
import "./Auth.css";

function Login({ onAuth, setPage }) {
    const [form, setForm] = useState({ login: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.login.trim() || !form.password.trim()) {
            setError("Заполните все поля");
            return;
        }

        if (form.login === "admin" && form.password === "admin") {
            onAuth({ login: form.login, isRegistered: true });
        } else {
            setError("Неверный логин или пароль");
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Вход в аккаунт</h2>
                <div className="input-group">
                    <input
                        name="login"
                        type="text"
                        placeholder="Логин"
                        value={form.login}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <input
                        name="password"
                        type="password"
                        placeholder="Пароль"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                {error && <div className="error">{error}</div>}
                <button type="submit" className="auth-btn">
                    Войти
                </button>
                <p>
                    Нет аккаунта?{" "}
                    <span className="switch-link" onClick={() => setPage("register")}>
            Зарегистрироваться
          </span>
                </p>
            </form>
        </div>
    );
}

export default Login;

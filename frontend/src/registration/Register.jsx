import React, { useState } from "react";
import "./Auth.css";

function Register({ onAuth, setPage }) {
    const [form, setForm] = useState({ login: "", email: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.login.trim() || !form.email.trim() || form.password.length < 6) {
            setError("Логин, email и пароль (минимум 6 символов) обязательны");
            return;
        }
        localStorage.setItem("user", JSON.stringify(form));
        onAuth({ login: form.login, isRegistered: false });
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Регистрация</h2>
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
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <input
                        name="password"
                        type="password"
                        placeholder="Пароль (минимум 6 символов)"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                {error && <div className="error">{error}</div>}
                <button type="submit" className="auth-btn">
                    Зарегистрироваться
                </button>
                <p>
                    Уже есть аккаунт?{" "}
                    <span className="switch-link" onClick={() => setPage("login")}>
            Войти
          </span>
                </p>
            </form>
        </div>
    );
}

export default Register;

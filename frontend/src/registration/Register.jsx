import React, { useState } from "react";
import ApiService from "../ApiService";
import "./Auth.css";

function Register({ onAuth, setPage }) {
  const api = ApiService();

  const [form, setForm] = useState({ login: "", email: "", password: "" });
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.login.trim() || !form.email.trim() || form.password.length < 6) {
      setLocalError("Логин, email и пароль (минимум 6 символов) обязательны");
      return;
    }

    try {
      const data = await api.register(form); // ожидаем { token, user }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onAuth({ ...data.user, isRegistered: false });
    } catch (err) {
      setLocalError(err.message);
    }
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

        {(localError || api.error) && (
          <div className="error">{localError || api.error}</div>
        )}

        <button type="submit" className="auth-btn" disabled={api.loading}>
          {api.loading ? "Регистрируем..." : "Зарегистрироваться"}
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

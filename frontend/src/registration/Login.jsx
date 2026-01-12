import React, { useState } from "react";
import ApiService from "../ApiService";
import "./Auth.css";

function Login({ onAuth, setPage }) {
  const api = ApiService();

  const [form, setForm] = useState({ login: "", password: "" });
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.login.trim() || !form.password.trim()) {
      setLocalError("Заполните все поля");
      return;
    }

    try {
      const data = await api.login(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onAuth({ ...data.user, isRegistered: true });
    } catch (err) {
      setLocalError(err.message);
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

        {(localError || api.error) && (
          <div className="error">{localError || api.error}</div>
        )}

        <button type="submit" className="auth-btn" disabled={api.loading}>
          {api.loading ? "Входим..." : "Войти"}
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

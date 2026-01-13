import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../ApiService";
import "./BrowsePage.css";

function BrowsePage() {
    const navigate = useNavigate();
    const api = ApiService();

    const [login, setLogin] = useState("");
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const searchUserWishlists = async (e) => {
        e.preventDefault();
        if (!login.trim()) return;

        setLoading(true);
        setError("");
        setWishlists([]);

        try {
            const user = await api.getUser(login);
            if (!user) {
                setError("Пользователь не найден");
                return;
            }
            const lists = await api.getUserWishlists(login);
            setWishlists(lists || []);
        } catch (err) {
            console.error(err);
            setError("Ошибка при получении данных");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="browse-page">
            <h2>Поиск вишлистов пользователей</h2>
            <form className="search-form" onSubmit={searchUserWishlists}>
                <input
                    type="text"
                    placeholder="Введите логин пользователя"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                />
                <button type="submit">Поиск</button>
            </form>

            {/* Блок статуса (загрузка или ошибка) */}
            {(loading || error) && (
                <div className="status-message">
                    {loading && <span>Загрузка...</span>}
                    {error && <span className="error">{error}</span>}
                </div>
            )}

            {/* Результаты поиска */}
            {wishlists.length > 0 && (
                <div className="wishlists-list">
                    {wishlists.map((wl) => (
                        <div
                            key={wl.id}
                            className="wishlist-card"
                            onClick={() => navigate(`/public/${login}/${wl.id}`)}
                        >
                            <h3>{wl.name}</h3>
                            {wl.description && <p>{wl.description}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BrowsePage;

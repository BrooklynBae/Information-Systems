import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../ApiService";
import "./WishlistDashboard.css";
import BrowsePage from "../browsePage/BrowsePage";

function WishlistDashboard() {
    const [wishlists, setWishlists] = useState([]);
    const [newWishlistName, setNewWishlistName] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const api = useMemo(() => ApiService(), []);

    // Один fetch всех вишлистов
    useEffect(() => {
        const fetchWishlists = async () => {
            try {
                const data = await api.getWishlists();
                setWishlists(data || []);
            } catch (err) {
                console.error("Ошибка загрузки вишлистов:", err);
            }
        };

        fetchWishlists();
    }, [api]);

    const createWishlist = async (e) => {
        e.preventDefault();
        if (!newWishlistName.trim()) return;

        try {
            setLoading(true);
            const wishlist = await api.createWishlist({
                name: newWishlistName.trim(),
                description: "Подарки"
            });
            setWishlists(prev => [wishlist, ...prev]);
            setNewWishlistName("");
        } catch (err) {
            console.error("Ошибка создания вишлиста:", err);
        } finally {
            setLoading(false);
        }
    };

    const deleteWishlist = async (wishlistId) => {
        try {
            await api.deleteWishlist(wishlistId);
            setWishlists(prev => prev.filter(w => w.id !== wishlistId));
        } catch (err) {
            console.error("Ошибка удаления вишлиста:", err);
        }
    };

    const openWishlist = (wishlistId) => {
        navigate(`/wishlist/${wishlistId}`);
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <section className="browse-section">
                    <BrowsePage/>
                </section>
                <h1>Wishlisty</h1>
                <p>Управляйте своими списками желаний</p>
            </header>

            <form className="create-form" onSubmit={createWishlist}>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Название нового вишлиста"
                        value={newWishlistName}
                        onChange={(e) => setNewWishlistName(e.target.value)}
                        maxLength={50}
                    />
                    <button type="submit" disabled={loading || !newWishlistName.trim()}>
                        {loading ? "Создаём..." : "Создать"}
                    </button>
                </div>
            </form>

            <div className="wishlists-grid">
                {wishlists.map((wishlist) => (
                    <div key={wishlist.id} className="wishlist-card">
                        <div className="wishlist-info">
                            <h3>{wishlist.name}</h3>
                            <div className="wishlist-stats">
                                <span className="items-count">{wishlist.itemsCount || 0} желаний</span>
                                {wishlist.updatedAt && (
                                    <span className="updated-at">
                                        Обновлён: {new Date(wishlist.updatedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="wishlist-actions">
                            <button
                                className="open-btn"
                                onClick={() => openWishlist(wishlist.id)}
                            >
                                Открыть
                            </button>
                            <button
                                className="delete-btn"
                                onClick={() => deleteWishlist(wishlist.id)}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {!wishlists.length && !loading && (
                <div className="empty-state">
                    <h2>У вас пока нет вишлистов</h2>
                    <p>Создайте первый вишлист, чтобы начать добавлять желания!</p>
                </div>
            )}
        </div>
    );
}

export default WishlistDashboard;

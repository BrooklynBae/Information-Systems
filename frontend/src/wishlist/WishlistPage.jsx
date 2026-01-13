import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../ApiService";
import "./WishlistPage.css";

function WishlistPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const api = useMemo(() => ApiService(), []);

    const [wishlist, setWishlist] = useState(null);
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        name: "",
        link: "",
        priceCents: "",
        isDivisible: false,
    });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        const fetchWishlistAndItems = async () => {
            try {
                const wishlistData = await api.getWishlist(id);
                const itemsData = await api.getWishlistItem(id);
                setWishlist(wishlistData);
                setItems(itemsData || []);
            } catch (err) {
                console.error("Ошибка загрузки:", err);
                navigate("/dashboard");
            }
        };

        if (id) fetchWishlistAndItems();
    }, [id, navigate, api]);

    const addItem = async (e) => {
        e.preventDefault();
        if (!newItem.name.trim()) return;

        try {
            const itemToSend = {
                ...newItem,
                priceCents: newItem.priceCents ? parseInt(newItem.priceCents, 10) : 0,
            };
            await api.createWishlistItem(id, itemToSend);

            // после добавления заново подгружаем айтемы
            const itemsData = await api.getWishlistItem(id);
            setItems(itemsData || []);
            setNewItem({ name: "", link: "", priceCents: "", isDivisible: false });
        } catch (err) {
            console.error("Ошибка добавления:", err);
        }
    };



    const deleteItem = async (itemId) => {
        try {
            await api.deleteWishlistItem(id, itemId);
            setItems(prev => prev.filter(item => item.id !== itemId));
        } catch (err) {
            console.error("Ошибка удаления:", err);
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditForm({ ...item });
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            const updatedItem = await api.updateWishlistItem(id, editingId, editForm);
            setItems(prev => prev.map(item => item.id === editingId ? updatedItem : item));
            setEditingId(null);
            setEditForm({});
        } catch (err) {
            console.error("Ошибка обновления:", err);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    if (!wishlist) return <div className="loading">Загрузка вишлиста...</div>;

    return (
        <div className="wishlist-page">
            <header className="wishlist-header">
                <button className="back-btn" onClick={() => navigate("/dashboard")}>
                    ← Назад
                </button>
                <h1>{wishlist.name}</h1>
            </header>

            <form className="add-item-form" onSubmit={addItem}>
                <input
                    placeholder="Название желания"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    required
                />
                <input
                    placeholder="Ссылка (опционально)"
                    value={newItem.link}
                    onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Цена в ₽ (опционально)"
                    value={newItem.priceCents}
                    onChange={(e) => setNewItem({ ...newItem, priceCents: e.target.value })}
                />
                <label className="checkbox-field">
                    <input
                        type="checkbox"
                        checked={newItem.isDivisible}
                        onChange={(e) => setNewItem({ ...newItem, isDivisible: e.target.checked })}
                    />
                    Можно делить оплату
                </label>
                <button type="submit" className="add-btn">Добавить</button>
            </form>


            <div className="items-list">
                {items.length === 0 ? (
                    <div className="empty-message">Нет желаний 😢 Добавьте новое!</div>
                ) : (
                    items.map((item, index) => (
                        <div key={item.id ?? index} className="item-card">
                            {editingId === item.id ? (
                                <form onSubmit={saveEdit} className="edit-form">
                                    <label>
                                        Название желания
                                        <input
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            required
                                        />
                                    </label>
                                    <label>
                                        Ссылка
                                        <input
                                            value={editForm.link || ""}
                                            onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                                        />
                                    </label>
                                    <label>
                                        Цена в ₽
                                        <input
                                            type="number"
                                            value={editForm.priceCents || ""}
                                            onChange={(e) => setEditForm({ ...editForm, priceCents: e.target.value })}
                                        />
                                    </label>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={editForm.isDivisible || false}
                                            onChange={(e) => setEditForm({ ...editForm, isDivisible: e.target.checked })}
                                        />
                                        Можно делить оплату
                                    </label>
                                    <div className="edit-actions">
                                        <button type="submit">Сохранить</button>
                                        <button type="button" onClick={cancelEdit}>Отмена</button>
                                    </div>
                                </form>

                            ) : (
                                <>
                                    <div className="item-content">
                                        <h3>{item.name}</h3>
                                        {item.link && (
                                            <a href={item.link} target="_blank" rel="noopener noreferrer">Перейти</a>
                                        )}
                                        {item.priceCents > 0 && (
                                            <div className="item-price">
                                                💰 {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(item.priceCents / 100)}
                                            </div>
                                        )}
                                        {item.isDivisible && <div className="item-divisible">Можно разделить</div>}
                                    </div>
                                    <div className="item-actions">
                                        <button className="edit-btn" onClick={() => startEdit(item)}>✏️</button>
                                        <button className="delete-btn" onClick={() => deleteItem(item.id)}>🗑️</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default WishlistPage;

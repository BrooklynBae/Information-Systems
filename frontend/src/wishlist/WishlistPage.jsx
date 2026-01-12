import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../ApiService";
import "./WishlistPage.css";

function WishlistPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState(null);
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: "", url: "", price: "", comment: "" });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState(null); // для меню трех точек
    const api = ApiService();

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const wishlistData = await api.getWishlist(id);
                setWishlist(wishlistData);

                const itemsData = await api.getWishlistItem(id);
                setItems(itemsData || []);
            } catch (err) {
                console.error(err);
                navigate("/dashboard");
            }
        };

        if (id) fetchWishlist();
    }, [id, api, navigate]);

    const toggleAddForm = () => setShowAddForm(prev => !prev);

    const addItem = async (e) => {
        e.preventDefault();
        if (!newItem.name.trim()) return;

        try {
            const item = await api.createWishlistItem(id, newItem);
            setItems(prev => [item, ...prev]);
            setNewItem({ name: "", url: "", price: "", comment: "" });
            setShowAddForm(false);
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
        setMenuOpenId(null);
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

    if (!wishlist) return <div className="loading">Загрузка...</div>;

    return (
        <div className="wishlist-page">
            <header className="wishlist-header">
                <button className="back-btn" onClick={() => navigate("/dashboard")}>Назад</button>
                <h1>{wishlist.name}</h1>
                <button className="add-btn" onClick={toggleAddForm}>＋</button>
            </header>

            {showAddForm && (
                <form className="add-item-form" onSubmit={addItem}>
                    <input
                        placeholder="Название желания"
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        required
                    />
                    <input
                        placeholder="Ссылка (опционально)"
                        value={newItem.url}
                        onChange={(e) => setNewItem({...newItem, url: e.target.value})}
                    />
                    <input
                        placeholder="Цена (опционально)"
                        value={newItem.price}
                        onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    />
                    <button type="submit">Добавить</button>
                </form>
            )}

            <div className="items-list">
                {items.length === 0 ? (
                    <div className="empty-message">У вас пока нет подарков :(</div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="item-card">
                            {editingId === item.id ? (
                                <form onSubmit={saveEdit} className="edit-form">
                                    <input
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        required
                                    />
                                    <input
                                        value={editForm.url || ""}
                                        onChange={(e) => setEditForm({...editForm, url: e.target.value})}
                                    />
                                    <input
                                        value={editForm.price || ""}
                                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                    />
                                    <div className="edit-actions">
                                        <button type="submit">Сохранить</button>
                                        <button type="button" onClick={cancelEdit}>Отмена</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="item-row">
                                    <div className="item-info">
                                        <h3>{item.name}</h3>
                                        {item.url &&
                                            <a href={item.url} target="_blank" rel="noopener noreferrer">Перейти</a>}
                                        {item.price && <div className="item-price">💰 {item.price}</div>}
                                        {item.comment && <div className="item-comment">{item.comment}</div>}
                                    </div>

                                    <div className="item-menu">
                                        <button
                                            onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}>⋯
                                        </button>
                                        {menuOpenId === item.id && (
                                            <div className="menu-dropdown">
                                                <button onClick={() => startEdit(item)}>Редактировать</button>
                                                <button onClick={() => deleteItem(item.id)}>Удалить</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

        </div>
    );
}

export default WishlistPage;

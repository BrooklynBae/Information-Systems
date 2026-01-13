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
    priceRub: "",
    isDivisible: false,
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const load = async () => {
    const wishlistData = await api.getWishlist(id);
    const itemsData = await api.getWishlistItems(id);
    setWishlist(wishlistData);
    setItems(itemsData || []);
  };

  useEffect(() => {
    const run = async () => {
      try {
        await load();
      } catch (err) {
        console.error("Ошибка загрузки:", err);
        navigate("/dashboard");
      }
    };
    if (id) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    try {
      const priceCents = newItem.priceRub
        ? Math.round(Number(newItem.priceRub) * 100)
        : 0;

      await api.createWishlistItem(id, {
        name: newItem.name.trim(),
        link: newItem.link || "",
        isDivisible: !!newItem.isDivisible,
        priceCents,
      });

      await load();
      setNewItem({ name: "", link: "", priceRub: "", isDivisible: false });
    } catch (err) {
      console.error("Ошибка добавления:", err);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await api.deleteWishlistItem(id, itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Ошибка удаления:", err);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      id: item.id,
      name: item.name || "",
      link: item.link || "",
      isDivisible: !!item.isDivisible,
      priceRub: item.priceCents ? (item.priceCents / 100).toFixed(2) : "",
    });
  };

  // ✅ КЛЮЧЕВОЙ ФИКС: не используем ответ update как updatedItem
  // потому что бэк может вернуть {ok:true}, и ты затираешь элемент.
  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: (editForm.name || "").trim(),
        link: editForm.link || "",
        isDivisible: !!editForm.isDivisible,
        priceCents: editForm.priceRub ? Math.round(Number(editForm.priceRub) * 100) : 0,
      };

      await api.updateWishlistItem(id, editingId, payload);

      // ✅ обновляем список с сервера — UI всегда будет корректный
      await load();

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

  const safeLabelStyle = { display: "block", fontSize: 13, opacity: 0.9, marginTop: 8 };
  const safeInputStyle = {
    width: "100%",
    padding: "10px 12px",
    marginTop: 6,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    color: "#111",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div className="wishlist-page">
      <header className="wishlist-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Назад
        </button>
        <h1>{wishlist.name}</h1>
        {wishlist.description && <p>{wishlist.description}</p>}
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
          step="0.01"
          placeholder="Цена в ₽ (опционально)"
          value={newItem.priceRub}
          onChange={(e) => setNewItem({ ...newItem, priceRub: e.target.value })}
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
                <>
                  <div className="item-content" style={{ width: "100%" }}>
                    <form onSubmit={saveEdit} className="edit-form">
                      <label style={safeLabelStyle}>
                        Название желания
                        <input
                          style={safeInputStyle}
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          required
                        />
                      </label>

                      <label style={safeLabelStyle}>
                        Ссылка
                        <input
                          style={safeInputStyle}
                          value={editForm.link}
                          onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                        />
                      </label>

                      <label style={safeLabelStyle}>
                        Цена в ₽
                        <input
                          style={safeInputStyle}
                          type="number"
                          step="0.01"
                          value={editForm.priceRub}
                          onChange={(e) => setEditForm({ ...editForm, priceRub: e.target.value })}
                        />
                      </label>

                      <label style={{ ...safeLabelStyle, display: "flex", gap: 10, alignItems: "center" }}>
                        <input
                          type="checkbox"
                          checked={!!editForm.isDivisible}
                          onChange={(e) => setEditForm({ ...editForm, isDivisible: e.target.checked })}
                        />
                        Можно делить оплату
                      </label>

                      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                        <button type="submit">Сохранить</button>
                        <button type="button" onClick={cancelEdit}>Отмена</button>
                      </div>
                    </form>
                  </div>

                  <div className="item-actions" />
                </>
              ) : (
                <>
                  <div className="item-content">
                    <h3>{item.name}</h3>

                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        Перейти
                      </a>
                    )}

                    {item.priceCents > 0 && (
                      <div className="item-price">
                        💰{" "}
                        {new Intl.NumberFormat("ru-RU", {
                          style: "currency",
                          currency: "RUB",
                        }).format(item.priceCents / 100)}
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

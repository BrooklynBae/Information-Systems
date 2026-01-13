import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../ApiService";
import "./WishlistPage.css";

function WishlistPage({ mode = "own" }) {
  const { id, login } = useParams(); // login будет только на public route
  const navigate = useNavigate();
  const api = useMemo(() => ApiService(), []);

  const isPublic = mode === "public" || !!login;

  const [wishlistTitle, setWishlistTitle] = useState("");
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
    const load = async () => {
      try {
        const listId = Number(id);

        // Заголовок
        if (isPublic) {
          setWishlistTitle(`Вишлист пользователя ${login} (#${listId})`);

          // можно попытаться взять название из списка вишлистов пользователя
          try {
            const wls = await api.getUserWishlists(login);
            const found = (wls || []).find((w) => w.id === listId);
            if (found?.name) setWishlistTitle(`${found.name} (user: ${login})`);
          } catch {}
        } else {
          // пытаемся получить meta вишлиста (если бэк умеет)
          try {
            const meta = await api.getWishlist(listId);
            if (meta?.name) setWishlistTitle(meta.name);
            else setWishlistTitle(`Мой вишлист #${listId}`);
          } catch {
            setWishlistTitle(`Мой вишлист #${listId}`);
          }
        }

        // Items
        const itemsData = isPublic
          ? await api.getUserWishlistItems(login, listId)
          : await api.getWishlistItems(listId);

        setItems(itemsData || []);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
        navigate("/dashboard");
      }
    };

    if (id) load();
  }, [id, login, isPublic, api, navigate]);

  // ===== OWN ONLY actions =====
  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    try {
      const listId = Number(id);
      const itemToSend = {
        ...newItem,
        priceCents: newItem.priceCents ? parseInt(newItem.priceCents, 10) : 0,
      };

      const created = await api.createWishlistItem(listId, itemToSend);
      // если бэк возвращает {ok:true}, перезагрузи items
      if (created?.id) setItems((prev) => [created, ...prev]);
      else {
        const reloaded = await api.getWishlistItems(listId);
        setItems(reloaded || []);
      }

      setNewItem({ name: "", link: "", priceCents: "", isDivisible: false });
    } catch (err) {
      console.error("Ошибка добавления:", err);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const listId = Number(id);
      await api.deleteWishlistItem(listId, itemId);
      setItems((prev) => prev.filter((x) => x.id !== itemId));
    } catch (err) {
      console.error("Ошибка удаления:", err);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      ...item,
      // если сервер хранит priceCents как number, оставим так
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const listId = Number(id);

      const dataToSend = {
        name: editForm.name,
        link: editForm.link || "",
        isDivisible: !!editForm.isDivisible,
        priceCents: editForm.priceCents ? Number(editForm.priceCents) : 0,
      };

      const updated = await api.updateWishlistItem(listId, editingId, dataToSend);

      // если бэк возвращает {ok:true}, то перезагружаем список
      if (updated?.id) {
        setItems((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
      } else {
        const reloaded = await api.getWishlistItems(listId);
        setItems(reloaded || []);
      }

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

  return (
    <div className="wishlist-page">
      <header className="wishlist-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Назад
        </button>
        <h1>{wishlistTitle || "Вишлист"}</h1>
      </header>

      {!isPublic && (
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
              onChange={(e) =>
                setNewItem({ ...newItem, isDivisible: e.target.checked })
              }
            />
            Можно делить оплату
          </label>
          <button type="submit" className="add-btn">
            Добавить
          </button>
        </form>
      )}

      <div className="items-list">
        {items.length === 0 ? (
          <div className="empty-message">Нет желаний 😢</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="item-card">
              {editingId === item.id ? (
                <form onSubmit={saveEdit} className="edit-form">
                  <label>
                    Название желания
                    <input
                      value={editForm.name || ""}
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
                    Цена (в копейках)
                    <input
                      type="number"
                      value={editForm.priceCents ?? 0}
                      onChange={(e) =>
                        setEditForm({ ...editForm, priceCents: e.target.value })
                      }
                    />
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={!!editForm.isDivisible}
                      onChange={(e) =>
                        setEditForm({ ...editForm, isDivisible: e.target.checked })
                      }
                    />
                    Можно делить оплату
                  </label>

                  <div className="edit-actions">
                    <button type="submit">Сохранить</button>
                    <button type="button" onClick={cancelEdit}>
                      Отмена
                    </button>
                  </div>
                </form>
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

                  {!isPublic && (
                    <div className="item-actions">
                      <button className="edit-btn" onClick={() => startEdit(item)}>
                        ✏️
                      </button>
                      <button className="delete-btn" onClick={() => deleteItem(item.id)}>
                        🗑️
                      </button>
                    </div>
                  )}
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

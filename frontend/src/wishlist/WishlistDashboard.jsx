import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../ApiService";
import "./WishlistDashboard.css";
import BrowsePage from "../browsePage/BrowsePage";

function WishlistDashboard() {
  const [wishlists, setWishlists] = useState([]);
  const [newWishlistName, setNewWishlistName] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const api = useMemo(() => ApiService(), []);

  const loadWishlists = async () => {
    setError("");
    try {
      const data = await api.getWishlists();
      setWishlists(data || []);
    } catch (err) {
      console.error("Ошибка загрузки вишлистов:", err);
      setError(err.message || "Не удалось загрузить вишлисты");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadWishlists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const createWishlist = async (e) => {
    e.preventDefault();
    if (!newWishlistName.trim()) return;

    setLoadingCreate(true);
    setError("");

    try {
      const wishlist = await api.createWishlist({
        name: newWishlistName.trim(),
        description: "Подарки", // ✅ фиксированно, поле убрано
      });

      setWishlists((prev) => [wishlist, ...prev]);
      setNewWishlistName("");
    } catch (err) {
      console.error("Ошибка создания вишлиста:", err);
      setError(err.message || "Не удалось создать вишлист");
    } finally {
      setLoadingCreate(false);
    }
  };

  // ✅ Удаление вишлиста даже если там есть items (без правок бэка):
  // сначала удаляем items, потом wishlist
  const deleteWishlistCascade = async (wishlistId) => {
    setError("");
    setDeletingId(wishlistId);

    try {
      const items = await api.getWishlistItems(wishlistId).catch(() => []);
      if (Array.isArray(items) && items.length > 0) {
        await Promise.all(
          items.map((it) =>
            api.deleteWishlistItem(wishlistId, it.id).catch((e) => {
              console.warn("Не удалился item", it.id, e);
              return null;
            })
          )
        );
      }

      await api.deleteWishlist(wishlistId);
      setWishlists((prev) => prev.filter((w) => w.id !== wishlistId));
    } catch (err) {
      console.error("Ошибка удаления вишлиста:", err);
      setError(err.message || "Не удалось удалить вишлист");
    } finally {
      setDeletingId(null);
    }
  };

  const openWishlist = (wishlistId) => {
    navigate(`/wishlist/${wishlistId}`);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        {/* ✅ Название сервиса вернул */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>
              WishList
            </div>
            <div style={{ opacity: 0.8, marginTop: 2 }}>Мои вишлисты</div>
          </div>

          <button onClick={logout}>Выйти</button>
        </div>

        <section className="browse-section small" style={{ marginTop: 14 }}>
          <BrowsePage />
        </section>
      </header>

      {error && (
        <div className="error" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}

      <form className="create-form" onSubmit={createWishlist}>
        <div className="input-group">
          <input
            type="text"
            placeholder="Название нового вишлиста"
            value={newWishlistName}
            onChange={(e) => setNewWishlistName(e.target.value)}
            maxLength={50}
          />
          <button
            type="submit"
            disabled={loadingCreate || !newWishlistName.trim()}
          >
            {loadingCreate ? "Создаём..." : "Создать"}
          </button>
        </div>
        {/* ✅ поле/кнопку “Подарки” убрали полностью */}
      </form>

      {initialLoading ? (
        <div className="loading" style={{ marginTop: 16 }}>
          Загрузка...
        </div>
      ) : (
        <>
          <div className="wishlists-grid">
            {wishlists.map((wishlist) => (
              <div key={wishlist.id} className="wishlist-card">
                <div className="wishlist-info">
                  <h3 style={{ marginBottom: 6 }}>{wishlist.name}</h3>
                  {wishlist.description && (
                    <div style={{ opacity: 0.8, fontSize: 14 }}>
                      {wishlist.description}
                    </div>
                  )}
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
                    onClick={() => deleteWishlistCascade(wishlist.id)}
                    disabled={deletingId === wishlist.id}
                    title="Удалить вишлист"
                  >
                    {deletingId === wishlist.id ? "…" : "🗑️"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!wishlists.length && (
            <div className="empty-state">
              <h2>У вас пока нет вишлистов</h2>
              <p>Создайте первый вишлист, чтобы начать добавлять желания!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WishlistDashboard;

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../ApiService";
import "./PublicWishlistPage.css"; // ✅ отдельный CSS

function PublicWishlistPage() {
  const { login, listId } = useParams();
  const navigate = useNavigate();
  const api = useMemo(() => ApiService(), []);

  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [contribution, setContribution] = useState("");

  const reloadItems = async () => {
    const itemsData = await api.getUserWishlistItems(login, listId);
    setItems(itemsData || []);
  };

  useEffect(() => {
    const fetchWishlistAndItems = async () => {
      try {
        const wishlists = await api.getUserWishlists(login);
        const wl = wishlists.find((w) => w.id === Number(listId));
        if (!wl) {
          setError("Вишлист не найден");
          return;
        }
        setWishlist(wl);
        await reloadItems();
      } catch (err) {
        console.error(err);
        setError("Ошибка при загрузке вишлиста");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistAndItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, login, listId]);

  const reserveItem = async (itemId) => {
    try {
      await api.reserveItem(itemId);
      await reloadItems();
      alert("Подарок забронирован!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Ошибка бронирования");
    }
  };

  const openContributionModal = (item) => {
    setSelectedItem(item);
    setContribution("");
    setShowModal(true);
  };

  const submitContribution = async () => {
    if (!contribution || isNaN(contribution) || Number(contribution) <= 0) return;

    try {
      const amountCents = Math.round(Number(contribution) * 100);
      await api.contributeToItem(selectedItem.id, amountCents);
      await reloadItems();
      setShowModal(false);
      alert(`Вы внесли ${Number(contribution).toFixed(2)} ₽`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Ошибка взноса");
    }
  };

  if (loading) return <div className="pw-loading">Загрузка...</div>;
  if (error) return <div className="pw-error">{error}</div>;
  if (!wishlist) return null;

  return (
    <div className="pw-page">
      <header className="pw-header">
        <button className="pw-btn" onClick={() => navigate(-1)}>← Назад</button>

        <div className="pw-title">
          <h1>{wishlist.name}</h1>
          {wishlist.description && <p>{wishlist.description}</p>}
          <div className="pw-subtitle">
            Вишлист пользователя <b>@{login}</b>
          </div>
        </div>
      </header>

      <div className="pw-items">
        {items.length === 0 ? (
          <div className="pw-empty">В этом вишлисте пока нет предметов 😢</div>
        ) : (
          items.map((item) => {
            const reserved = !item.isDivisible && item.reservedByLogin;
            const priceRub = item.priceCents > 0 ? (item.priceCents / 100).toFixed(2) : null;

            const contributedRub = item.isDivisible
              ? (Number(item.contributedCents || 0) / 100).toFixed(2)
              : null;

            const myRub = item.isDivisible
              ? (Number(item.myContributionCents || 0) / 100).toFixed(2)
              : null;

            return (
              <div key={item.id} className="pw-itemCard">
                <div className="pw-itemMain">
                  <h3>{item.name}</h3>

                  {item.link && (
                    <a className="pw-link" href={item.link} target="_blank" rel="noopener noreferrer">
                      Перейти по ссылке
                    </a>
                  )}

                  {priceRub && <div className="pw-price">💰 {priceRub} ₽</div>}

                  {item.isDivisible ? (
                    <div className="pw-meta">
                      <div>Можно разделить оплату</div>
                      <div className="pw-progress">
                        Собрано: <b>{contributedRub} ₽</b> • Участников: <b>{item.contributorsCount || 0}</b>
                      </div>
                      {Number(item.myContributionCents || 0) > 0 && (
                        <div className="pw-progress">Мой взнос: <b>{myRub} ₽</b></div>
                      )}
                    </div>
                  ) : reserved ? (
                    <div className="pw-meta">
                      🔒 Забронировано пользователем: <b>{item.reservedByLogin}</b>
                      {item.reservedByMe ? <span> (это вы)</span> : null}
                    </div>
                  ) : null}
                </div>

                <div className="pw-actions">
                  {!item.isDivisible && !reserved && (
                    <button className="pw-btn primary" onClick={() => reserveItem(item.id)}>
                      Забронировать
                    </button>
                  )}

                  {item.isDivisible && (
                    <button className="pw-btn primary" onClick={() => openContributionModal(item)}>
                      Внести сумму
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && selectedItem && (
        <div className="pw-modalBackdrop">
          <div className="pw-modal">
            <h2>Внести сумму для “{selectedItem.name}”</h2>

            <input
              className="pw-input"
              type="number"
              step="0.01"
              placeholder="Сумма в ₽"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
            />

            <div className="pw-modalActions">
              <button className="pw-btn primary" onClick={submitContribution}>Внести</button>
              <button className="pw-btn" onClick={() => setShowModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicWishlistPage;

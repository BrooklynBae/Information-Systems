import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../ApiService";
import "./PublicWishlistPage.css";

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

    useEffect(() => {
        const fetchWishlistAndItems = async () => {
            try {
                const wishlists = await api.getUserWishlists(login);
                const wl = wishlists.find(w => w.id === parseInt(listId));
                if (!wl) {
                    setError("Вишлист не найден");
                    return;
                }
                setWishlist(wl);

                const itemsData = await api.getUserWishlistItems(login, listId);
                setItems(itemsData || []);
            } catch (err) {
                console.error(err);
                setError("Ошибка при загрузке вишлиста");
            } finally {
                setLoading(false);
            }
        };
        fetchWishlistAndItems();
    }, [api, login, listId]);

    const reserveItem = async (itemId) => {
        try {
            await api.reserveItem(itemId);
            alert("Подарок забронирован!");
        } catch (err) {
            console.error(err);
            alert("Ошибка бронирования");
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
            await api.contributeToItem(selectedItem.id, Math.round(Number(contribution) * 100));
            alert(`Вы внесли ${Number(contribution).toFixed(2)} ₽`);
            setShowModal(false);
        } catch (err) {
            console.error(err);
            alert("Ошибка взноса");
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="public-wishlist-page">
            <header>
                <button onClick={() => navigate(-1)}>← Назад</button>
                <h1>{wishlist.name}</h1>
                {wishlist.description && <p>{wishlist.description}</p>}
            </header>

            <div className="items-list">
                {items.length === 0 ? (
                    <div className="empty-message">В этом вишлисте пока нет предметов 😢</div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="item-card">
                            <h3>{item.name}</h3>
                            {item.link && (
                                <a href={item.link} target="_blank" rel="noopener noreferrer">Перейти</a>
                            )}
                            {item.priceCents > 0 && (
                                <div className="item-price">💰 {(item.priceCents / 100).toFixed(2)} ₽</div>
                            )}
                            {item.isDivisible && <div className="item-divisible">Можно разделить оплату</div>}

                            <div className="item-actions">
                                <button onClick={() => reserveItem(item.id)}>Забронировать полностью</button>
                                {item.isDivisible && (
                                    <button onClick={() => openContributionModal(item)}>Разделить подарок</button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h2>Внести сумму для "{selectedItem.name}"</h2>
                        <input
                            type="number"
                            placeholder="Сумма в ₽"
                            value={contribution}
                            onChange={(e) => setContribution(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button onClick={submitContribution}>Внести</button>
                            <button onClick={() => setShowModal(false)}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PublicWishlistPage;

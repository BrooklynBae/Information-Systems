import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../ApiService";

function WishlistPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const api = ApiService();

    const [wishlist, setWishlist] = useState(null);
    const [items, setItems] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchWishlist = async () => {
            try {
                const w = await api.getWishlist(id);
                setWishlist(w);

                const its = await api.getWishlistItem(id);
                setItems(its || []);
            } catch (err) {
                console.error("Ошибка загрузки:", err);
                navigate("/dashboard");
            }
        };

        if (id) fetchWishlist();
    }, [id, navigate, api]);

    if (!wishlist) return <div>Загрузка...</div>;

    return (
        <div>
            <h1>{wishlist.name}</h1>
            {items.map(i => <div key={i.id}>{i.name}</div>)}
        </div>
    );
}

export default WishlistPage;

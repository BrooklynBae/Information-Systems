import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './registration/AuthPage';
import WishlistDashboard from './wishlist/WishlistDashboard';
import WishlistPage from './wishlist/WishlistPage';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/register" element={<AuthPage />} />

                    <Route
                        path="/dashboard"
                        element={
                            localStorage.getItem("user") ? (
                                <WishlistDashboard />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                    <Route
                        path="/wishlist/:id"
                        element={
                            localStorage.getItem("user") ? (
                                <WishlistPage />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />

                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

/**
 * CartContext.jsx
 * Global multi-service cart state.
 * Cart item: { serviceId, pathwayId, serviceTitle, pathwayName, duration, priceRs }
 * priceRs = 0 means the item is "contact us" — never lands in cart.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Add or replace (one pathway per service at a time)
  const addToCart = useCallback((item) => {
    setCartItems((prev) => {
      const exists = prev.findIndex((i) => i.serviceId === item.serviceId);
      if (exists !== -1) {
        // Replace existing entry for this service
        const next = [...prev];
        next[exists] = item;
        return next;
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((serviceId) => {
    setCartItems((prev) => prev.filter((i) => i.serviceId !== serviceId));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const isInCart = useCallback(
    (serviceId, pathwayId) =>
      cartItems.some((i) => i.serviceId === serviceId && i.pathwayId === pathwayId),
    [cartItems],
  );

  const cartTotal = cartItems.reduce((sum, i) => sum + i.priceRs, 0);
  const itemCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, isInCart, cartTotal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

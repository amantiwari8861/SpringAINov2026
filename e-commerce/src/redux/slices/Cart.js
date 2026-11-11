import { createSelector, createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "cart";

// Load a previously saved cart (survives page reloads).
const loadCart = () => {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && item.id != null)
      .map((item) => ({
        ...item,
        quantity: Math.min(99, Math.max(1, Number(item.quantity) || 1)),
      }));
  } catch {
    return [];
  }
};

const initialState = {
  cartItems: loadCart(),
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // dispatch(addToCart(product)) or dispatch(addToCart(product, quantity))
    addToCart: {
      reducer: (state, action) => {
        const { product, quantity } = action.payload;
        if (!product || product.id == null) return;

        const existing = state.cartItems.find((item) => item.id === product.id);
        if (existing) {
          existing.quantity = Math.min(99, existing.quantity + quantity);
          return;
        }

        state.cartItems.push({ ...product, quantity: Math.min(99, quantity) });
      },
      prepare: (product, quantity = 1) => ({
        payload: {
          product,
          quantity: Math.min(99, Math.max(1, Math.floor(Number(quantity) || 1))),
        },
      }),
    },
    increaseQuantity: (state, action) => {
      const item = state.cartItems.find((item) => item.id === action.payload);
      if (item) item.quantity = Math.min(99, item.quantity + 1);
    },
    decreaseQuantity: (state, action) => {
      const item = state.cartItems.find((item) => item.id === action.payload);
      if (item) item.quantity = Math.max(1, item.quantity - 1);
    },
    setQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((item) => item.id === id);
      if (item) {
        item.quantity = Math.min(99, Math.max(1, Math.floor(Number(quantity) || 1)));
      }
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload
      );
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  setQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.cartItems;

export const selectCartCount = createSelector(selectCartItems, (items) =>
  items.reduce((total, item) => total + item.quantity, 0)
);

export const selectCartSubtotal = createSelector(selectCartItems, (items) =>
  items.reduce(
    (total, item) => total + Number(item.price || 0) * item.quantity,
    0
  )
);

export default cartSlice.reducer;
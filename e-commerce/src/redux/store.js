import { configureStore } from "@reduxjs/toolkit";
import cartReducers from "./slices/Cart";

export const store = configureStore({
  reducer: {
    cart: cartReducers,
  },
});

// Persist the cart so it survives a page reload.
if (typeof window !== "undefined") {
  store.subscribe(() => {
    try {
      window.localStorage.setItem(
        "cart",
        JSON.stringify(store.getState().cart.cartItems)
      );
    } catch {
      /* storage may be unavailable (private mode) — ignore */
    }
  });
}


// https://www.youtube.com/watch?v=EZF9CsxNYA0&list=PL1xhBcK58xmbGjEEcLc2_PT8_l_bP8zrW&index=14
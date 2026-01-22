import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from './types';
import { MOCK_PRODUCTS } from './constants';

interface AppState {
  cart: CartItem[];
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      cart: [],
      products: [], // Start with empty, fetch later
      isLoading: false,

      fetchProducts: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/products');
          if (res.ok) {
            const data = await res.json();
            set({ products: data.length > 0 ? data : MOCK_PRODUCTS });
          }
        } catch (err) {
          console.error('Fetch error:', err);
          set({ products: MOCK_PRODUCTS }); // Fallback
        } finally {
          set({ isLoading: false });
        }
      },

      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),

      clearCart: () => set({ cart: [] }),

      addProduct: (product) =>
        set((state) => ({ products: [product, ...state.products] })),

      deleteProduct: (id) =>
        set((state) => ({ products: state.products.filter(p => p.id !== id) })),
    }),
    {
      name: 'wooly-storage',
    }
  )
);
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, CategoryEntity } from './types';
import { MOCK_PRODUCTS, LEGACY_CATEGORIES } from './constants';

interface AppState {
  cart: CartItem[];
  products: Product[];
  categories: CategoryEntity[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categories: CategoryEntity[]) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      products: [], // Start with empty, fetch later
      categories: [],
      isLoading: false,

      fetchProducts: async () => {
        set({ isLoading: true });
        try {
          // Add cache-busting timestamp
          const res = await fetch(`/api/products?_t=${Date.now()}`);
          if (res.ok) {
            const data = await res.json();
            // Only use MOCK_PRODUCTS if data is null/undefined, not empty array
            set({ products: data && data.length >= 0 ? data : MOCK_PRODUCTS });
          }
        } catch (err) {
          console.error('Fetch products error:', err);
          // Only fallback if fetch totally fails
          set({ products: MOCK_PRODUCTS });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchCategories: async () => {
        try {
          const res = await fetch(`/api/categories?_t=${Date.now()}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              set({ categories: data });
              return;
            }
          }
        } catch (err) {
          console.error('Fetch categories error, using legacy fallback:', err);
        }
        // Fallback to legacy categories if API fails or table empty
        const fallback = LEGACY_CATEGORIES.map((name, i) => ({ id: `legacy-${i}`, name, sort_order: i }));
        set({ categories: fallback });
      },

      addCategory: async (name) => {
        try {
          const adminPass = localStorage.getItem('admin_pass') || '';
          const maxSort = get().categories.reduce((max, c) => Math.max(max, c.sort_order || 0), -1);
          const res = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': adminPass },
            body: JSON.stringify({ name, sort_order: maxSort + 1 })
          });
          if (res.ok) {
            await get().fetchCategories();
          }
        } catch (err) {
          console.error('Add category error:', err);
        }
      },

      deleteCategory: async (id) => {
        try {
          const adminPass = localStorage.getItem('admin_pass') || '';
          const res = await fetch(`/api/categories?id=${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': adminPass }
          });
          if (res.ok) {
            await get().fetchCategories();
          }
        } catch (err) {
          console.error('Delete category error:', err);
        }
      },

      reorderCategories: async (newCategories) => {
        // Optimistic update
        set({ categories: newCategories });
        try {
          const adminPass = localStorage.getItem('admin_pass') || '';
          const updates = newCategories.map((c, i) => ({ id: c.id, name: c.name, sort_order: i }));
          const res = await fetch('/api/categories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': adminPass },
            body: JSON.stringify(updates)
          });
          if (!res.ok) {
            await get().fetchCategories(); // Rollback on error
          }
        } catch (err) {
          console.error('Reorder categories error:', err);
          await get().fetchCategories();
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
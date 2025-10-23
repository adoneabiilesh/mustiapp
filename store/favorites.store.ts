import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      toggleFavorite: (productId: string) => {
        try {
          set((state) => {
            const favorites = Array.isArray(state.favorites) ? state.favorites : [];
            const isCurrentlyFavorite = favorites.includes(productId);
            
            if (isCurrentlyFavorite) {
              return { favorites: favorites.filter(id => id !== productId) };
            } else {
              return { favorites: [...favorites, productId] };
            }
          });
        } catch (error) {
          console.error('Error toggling favorite:', error);
          // Reset favorites to empty array if there's an error
          set({ favorites: [] });
        }
      },
      
      isFavorite: (productId: string) => {
        try {
          const state = get();
          const favorites = Array.isArray(state.favorites) ? state.favorites : [];
          return favorites.includes(productId);
        } catch (error) {
          console.error('Error checking favorite:', error);
          return false;
        }
      },
      
      addFavorite: (productId: string) => {
        try {
          set((state) => {
            const favorites = Array.isArray(state.favorites) ? state.favorites : [];
            if (!favorites.includes(productId)) {
              return { favorites: [...favorites, productId] };
            }
            return state;
          });
        } catch (error) {
          console.error('Error adding favorite:', error);
          set({ favorites: [] });
        }
      },
      
      removeFavorite: (productId: string) => {
        try {
          set((state) => {
            const favorites = Array.isArray(state.favorites) ? state.favorites : [];
            return { favorites: favorites.filter(id => id !== productId) };
          });
        } catch (error) {
          console.error('Error removing favorite:', error);
          set({ favorites: [] });
        }
      },
      
      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'favorites-storage',
      // Add custom serialization to ensure favorites is always an array
      serialize: (state) => {
        try {
          const favorites = Array.isArray(state.favorites) ? state.favorites : [];
          return JSON.stringify({ favorites });
        } catch (error) {
          console.error('Error serializing favorites:', error);
          return JSON.stringify({ favorites: [] });
        }
      },
      deserialize: (str) => {
        try {
          const parsed = JSON.parse(str);
          const favorites = Array.isArray(parsed.favorites) ? parsed.favorites : [];
          return { favorites };
        } catch (error) {
          console.error('Error deserializing favorites:', error);
          return { favorites: [] };
        }
      },
    }
  )
);

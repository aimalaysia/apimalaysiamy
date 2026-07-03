import { create } from 'zustand'
import type { SearchFilters } from '../types'

interface FilterStore extends SearchFilters {
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void
  resetFilters: () => void
}

export const useFilterStore = create<FilterStore>((set) => ({
  q: '',
  category: undefined,
  country: undefined,
  tier: undefined,
  auth: undefined,
  pricing: undefined,
  free: undefined,
  noAuth: undefined,
  setFilter: (key, value) => set({ [key]: value }),
  resetFilters: () => set({
    q: '', category: undefined, country: undefined, tier: undefined,
    auth: undefined, pricing: undefined, free: undefined, noAuth: undefined,
  }),
}))

interface FavoritesStore {
  favorites: string[]
  toggle: (id: string) => void
  isFavorite: (id: string) => boolean
}

const loadFavorites = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('myapi-favorites') || '[]')
  } catch { return [] }
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favorites: loadFavorites(),
  toggle: (id) => {
    const current = get().favorites
    const next = current.includes(id) ? current.filter(f => f !== id) : [...current, id]
    localStorage.setItem('myapi-favorites', JSON.stringify(next))
    set({ favorites: next })
  },
  isFavorite: (id) => get().favorites.includes(id),
}))

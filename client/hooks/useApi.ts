import { useQuery } from '@tanstack/react-query'
import { searchApis, fetchCategories, fetchApiById, fetchCatalogue, fetchCountries } from '../services/api'
import type { SearchFilters } from '../types'

export function useSearch(filters: SearchFilters) {
  return useQuery({
    queryKey: ['search', filters],
    queryFn: () => searchApis(filters),
    placeholderData: (prev) => prev,
  })
}

export function useCatalogue() {
  return useQuery({
    queryKey: ['catalogue'],
    queryFn: fetchCatalogue,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 15,
  })
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 1000 * 60 * 15,
  })
}

export function useApiDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['api', id],
    queryFn: () => fetchApiById(id!),
    enabled: !!id,
  })
}

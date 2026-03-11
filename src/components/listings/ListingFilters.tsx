'use client'

import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import type { Category } from '@/types'

export interface FiltersState {
  search:      string
  categoryId:  string
  cityId:      string
  freeOnly:    boolean
}

interface Props {
  filters:    FiltersState
  onChange:   (f: FiltersState) => void
  showFreeFilter?: boolean
}

export default function ListingFilters({ filters, onChange, showFreeFilter = false }: Props) {
  const supabase     = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [open,       setOpen]       = useState(false)

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  const update = (partial: Partial<FiltersState>) => onChange({ ...filters, ...partial })

  const hasActiveFilters = filters.categoryId || filters.freeOnly

  return (
    <div className="bg-white border-b border-gray-100 px-4 pb-3 pt-2">
      {/* חיפוש */}
      <div className="relative mb-2">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={filters.search}
          onChange={e => update({ search: e.target.value })}
          placeholder="חפש מודעות..."
          className="w-full border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
        />
        {filters.search && (
          <button
            onClick={() => update({ search: '' })}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* פילטרים */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
            hasActiveFilters
              ? 'bg-primary-50 border-primary-300 text-primary-700'
              : 'bg-gray-50 border-gray-200 text-gray-600'
          )}
        >
          <SlidersHorizontal size={13} />
          סינון
          {hasActiveFilters && <span className="bg-primary-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">!</span>}
        </button>

        {/* קטגוריות מהירות */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.slice(0, 5).map(cat => (
            <button
              key={cat.id}
              onClick={() => update({ categoryId: filters.categoryId === cat.id ? '' : cat.id })}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors flex-shrink-0',
                filters.categoryId === cat.id
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              )}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* פאנל סינון מורחב */}
      {open && (
        <div className="mt-3 p-3 bg-gray-50 rounded-xl space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">קטגוריה</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => update({ categoryId: '' })}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs border',
                  !filters.categoryId ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200'
                )}
              >
                הכל
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => update({ categoryId: filters.categoryId === cat.id ? '' : cat.id })}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs border',
                    filters.categoryId === cat.id
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-600 border-gray-200'
                  )}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {showFreeFilter && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">חינם בלבד</span>
              <button
                onClick={() => update({ freeOnly: !filters.freeOnly })}
                className={cn(
                  'w-10 h-5 rounded-full transition-colors relative',
                  filters.freeOnly ? 'bg-primary-500' : 'bg-gray-300'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  filters.freeOnly ? 'translate-x-1' : 'translate-x-5'
                )} />
              </button>
            </div>
          )}

          <button
            onClick={() => { update({ categoryId: '', freeOnly: false }); setOpen(false) }}
            className="text-xs text-red-500 font-medium"
          >
            נקה סינון
          </button>
        </div>
      )}
    </div>
  )
}

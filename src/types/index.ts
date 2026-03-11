// ============================================================
// טיפוסי TypeScript מרכזיים
// ============================================================

export type ListingType = 'giveaway' | 'sale' | 'wanted'
export type ListingStatus = 'available' | 'reserved' | 'completed' | 'expired'
export type UserRank = 'new_neighbor' | 'active_neighbor' | 'contributor' | 'hero'
export type FollowType = 'listing' | 'category' | 'search_term'
export type NotificationType =
  | 'new_message'
  | 'listing_status_changed'
  | 'listing_available_again'
  | 'new_matching_listing'
  | 'reserved_followup'
  | 'listing_expiring'

// ----------------------
// גיאוגרפיה
// ----------------------
export interface City {
  id: string
  name: string
  created_at: string
}

export interface Neighborhood {
  id: string
  city_id: string
  name: string
  created_at: string
  cities?: City
}

// ----------------------
// פרופיל משתמש
// ----------------------
export interface Profile {
  id: string
  display_name: string
  phone: string | null
  avatar_url: string | null
  neighborhood_id: string | null
  city_id: string | null
  total_listings: number
  total_giveaways: number
  total_completed: number
  rank: UserRank
  whatsapp_phone: string | null
  notifications_enabled: boolean
  created_at: string
  updated_at: string
  // joins
  neighborhoods?: Neighborhood
  cities?: City
}

// ----------------------
// קטגוריה
// ----------------------
export interface Category {
  id: string
  name: string
  emoji: string | null
  sort_order: number
}

// ----------------------
// מודעה
// ----------------------
export interface Listing {
  id: string
  user_id: string
  type: ListingType
  status: ListingStatus
  title: string
  description: string | null
  price: number | null
  category_id: string | null
  neighborhood_id: string | null
  city_id: string | null
  views_count: number
  reserved_at: string | null
  reserved_for: string | null
  completed_at: string | null
  expires_at: string
  whatsapp_visible: boolean
  created_at: string
  updated_at: string
  // joins
  profiles?: Profile
  categories?: Category
  neighborhoods?: Neighborhood
  cities?: City
  listing_images?: ListingImage[]
}

export interface ListingImage {
  id: string
  listing_id: string
  url: string
  sort_order: number
  created_at: string
}

// ----------------------
// שיחות ומסרים
// ----------------------
export interface Conversation {
  id: string
  listing_id: string | null
  participant_a: string
  participant_b: string
  last_message_at: string | null
  last_message_preview: string | null
  unread_a: number
  unread_b: number
  created_at: string
  // joins
  listings?: Listing
  profile_a?: Profile
  profile_b?: Profile
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  image_url: string | null
  is_read: boolean
  created_at: string
  // joins
  profiles?: Profile
}

// ----------------------
// עוקבים
// ----------------------
export interface Follow {
  id: string
  user_id: string
  follow_type: FollowType
  listing_id: string | null
  category_id: string | null
  search_term: string | null
  free_only: boolean
  created_at: string
}

// ----------------------
// התראות
// ----------------------
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  listing_id: string | null
  conversation_id: string | null
  is_read: boolean
  created_at: string
}

// ----------------------
// עזר UI
// ----------------------
export interface TabConfig {
  key: ListingType | 'all'
  label: string
  emoji: string
  color: string
  bgColor: string
}

export const TABS: TabConfig[] = [
  { key: 'giveaway', label: 'חינם',       emoji: '🎁', color: 'text-giveaway',  bgColor: 'bg-giveaway-light' },
  { key: 'sale',     label: 'למכירה',     emoji: '🏷️', color: 'text-sale',      bgColor: 'bg-sale-light' },
  { key: 'wanted',   label: 'מחפש/ת',    emoji: '🔍', color: 'text-wanted',    bgColor: 'bg-wanted-light' },
]

export const STATUS_LABELS: Record<ListingStatus, string> = {
  available: 'זמין',
  reserved:  'שמור',
  completed: 'הושלם',
  expired:   'פג תוקף',
}

export const RANK_LABELS: Record<UserRank, string> = {
  new_neighbor:    'שכן/ה חדש/ה',
  active_neighbor: 'שכן/ה פעיל/ה',
  contributor:     'תורם/ת לקהילה',
  hero:            'גיבור/ת השכונה',
}

export const RANK_EMOJI: Record<UserRank, string> = {
  new_neighbor:    '🌱',
  active_neighbor: '⭐',
  contributor:     '🌟',
  hero:            '🏆',
}

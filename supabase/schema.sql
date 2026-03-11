-- ============================================================
-- שכונה מרקט - סכמת מסד נתונים מלאה
-- ============================================================

-- הפעלת הרחבות נדרשות
create extension if not exists "uuid-ossp";

-- ============================================================
-- ערים ושכונות
-- ============================================================
create table cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz default now()
);

create table neighborhoods (
  id uuid primary key default uuid_generate_v4(),
  city_id uuid references cities(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique(city_id, name)
);

-- הכנסת נתוני ברירת מחדל - ערים ראשיות
insert into cities (name) values
  ('תל אביב-יפו'), ('ירושלים'), ('חיפה'), ('באר שבע'),
  ('ראשון לציון'), ('פתח תקווה'), ('נתניה'), ('אשדוד'),
  ('בני ברק'), ('חולה7�'), ('רמת גן'), ('גבעתיים'),
  ('הרצליה'), ('כפר סבא'), ('רעננה'), ('הוד השרון'),
  ('מודיעין'), ('אשקלון'), ('רחובות'), ('נס ציונה'),
  ('לוד'), ('רמלה'), ('בת ים'), ('אילת');

-- תל אביב - שכונות
with tel_aviv as (select id from cities where name = 'תל אביב-יפו')
insert into neighborhoods (city_id, name)
select tel_aviv.id, n from tel_aviv,
unnest(array[
  'פלורנטין','נווה צדק','לב תל אביב','הצפון הישן','הצפון החדש',
  'רמת אביב','רמת אביב ג''','אפקה','יפו','נווה שאנן',
  'כרם התימנים','מרכז העיר','שכונת התקווה','עזריאלי','הדר יוסף'
]) as n;

-- ירושלים - שכונות
with jerusalem as (select id from cities where name = 'ירושלים')
insert into neighborhoods (city_id, name)
select jerusalem.id, n from jerusalem,
unnest(array[
  'רחביה','טלביה','בקעה','הקטמון','מלחה','גילה','קטמון',
  'גבעת שאול','בית וגן','קרית משה','רמות','פסגת זאב',
  'ארנונה','עמק רפאים','גבעת מרדכי'
]) as n;

-- חיפה - שכונות
with haifa as (select id from cities where name = 'חיפה')
insert into neighborhoods (city_id, name)
select haifa.id, n from haifa,
unnest(array[
  'כרמל','חוף הכרמל','רמת שאול','אחוזה','דניה','כרמליה',
  'נווה שאנן','רמת הנשיא','קריית אליהו','נמל'
]) as n;

-- ============================================================
-- פרופילי משתמשים
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone text,
  avatar_url text,
  neighborhood_id uuid references neighborhoods(id),
  city_id uuid references cities(id),
  -- סטטיסטיקות קהילה
  total_listings int default 0,
  total_giveaways int default 0,
  total_completed int default 0,
  -- רמת פעילות: new_neighbor | active_neighbor | contributor | hero
  rank text default 'new_neighbor',
  -- הגדרות
  whatsapp_phone text,
  notifications_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- קטגוריות
-- ============================================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  emoji text,
  sort_order int default 0
);

insert into categories (name, emoji, sort_order) values
  ('ריהוט', '🛋️', 1),
  ('מוצרי חשמל', '💡', 2),
  ('ביגוד והנעלה', '👗', 3),
  ('ילדים ותינוקות', '👶', 4),
  ('ספרים ומשחקים', '📚', 5),
  ('כלי בית ומטבח', '🍳', 6),
  ('ספורט ופנאי', '⚽', 7),
  ('גינה וחוץ', '🌿', 8),
  ('רכב ואופניים', '🚲', 9),
  ('מוצרי יופי ובריאות', '💄', 10),
  ('אלקטרוניקה', '📱', 11),
  ('אמנות ואומנות', '🎨', 12),
  ('מזון ומשקאות', '🥗', 13),
  ('חיות מחמד', '🐾', 14),
  ('אחר', '📦', 15);

-- ============================================================
-- מודעות
-- ============================================================
create type listing_type as enum ('giveaway', 'sale', 'wanted');
create type listing_status as enum ('available', 'reserved', 'completed', 'expired');

create table listings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  -- סוג
  type listing_type not null,
  status listing_status default 'available',
  -- תוכן
  title text not null,
  description text,
  price decimal(10,2),              -- null אם חינם
  category_id uuid references categories(id),
  -- מיקום
  neighborhood_id uuid references neighborhoods(id),
  city_id uuid references cities(id),
  -- מטא
  views_count int default 0,
  reserved_at timestamptz,          -- מתי הפך לשמור
  reserved_for uuid references profiles(id),
  completed_at timestamptz,
  expires_at timestamptz default (now() + interval '14 days'),
  -- האם להציג מעבר לוואטסאפ
  whatsapp_visible boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- תמונות מודעות
-- ============================================================
create table listing_images (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade not null,
  url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- היסטוריית סטטוס מודעות
-- ============================================================
create table listing_status_history (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete cascade not null,
  old_status listing_status,
  new_status listing_status not null,
  changed_by uuid references profiles(id),
  note text,
  created_at timestamptz default now()
);

-- ============================================================
-- שיחות ומסרים
-- ============================================================
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete set null,
  -- שני המשתתפים
  participant_a uuid references profiles(id) on delete cascade not null,
  participant_b uuid references profiles(id) on delete cascade not null,
  -- מסר אחרון
  last_message_at timestamptz,
  last_message_preview text,
  -- הודעות שלא נקראו
  unread_a int default 0,
  unread_b int default 0,
  created_at timestamptz default now(),
  -- מניעת שכפול שיחה
`  unique(listing_id, participant_a, participant_b)
);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text,
  image_url text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- עוקבים ותחומי גניי
-- ============================================================
create type follow_type as enum ('listing', 'category', 'search_term');

create table follows (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  follow_type follow_type not null,
  -- אחד מהם יהיה מלא
  listing_id uuid references listings(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  search_term text,
  -- סינון נוסף
  free_only boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- התראות
-- ============================================================
create type notification_type as enum (
  'new_message',
  'listing_status_changed',
  'listing_available_again',
  'new_matching_listing',
  'reserved_followup',
  'listing_expiring'
);

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  type notification_type not null,
  title text not null,
  body text,
  -- נתוני הפניה
  listing_id uuid references listings(id) on delete set null,
  conversation_id uuid references conversations(id) on delete set null,
  -- סטטוס
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- אינדקסים לשיפור ביצועים
-- ============================================================
create index idx_listings_type on listings(type);
create index idx_listings_status on listings(status);
create index idx_listings_neighborhood on listings(neighborhood_id);
create index idx_listings_city on listings(city_id);
create index idx_listings_category on listings(category_id);
create index idx_listings_user on listings(user_id);
create index idx_listings_expires on listings(expires_at);
create index idx_listings_created on listings(created_at desc);
create index idx_messages_conversation on messages(conversation_id, created_at);
create index idx_notifications_user on notifications(user_id, is_read, created_at desc);
create index idx_follows_user on follows(user_id);
create index idx_conversations_participant_a on conversations(participant_a);
create index idx_conversations_participant_b on conversations(participant_b);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table profiles enable row level security;
alter table listings enable row level security;
alter table listing_images enable row level security;
alter table listing_status_history enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table follows enable row level security;
alter table notifications enable row level security;

-- פרופילים: קריאה ציבורית, כתיבה רק לבעלים
create policy "profiles_read_all" on profiles for select using (true);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- מודעות: קריאה ציבורית, כתיבה לבעלים
create policy "listings_read_all" on listings for select using (true);
create policy "listings_insert_own" on listings for insert with check (auth.uid() = user_id);
create policy "listings_update_own" on listings for update using (auth.uid() = user_id);
create policy "listings_delete_own" on listings for delete using (auth.uid() = user_id);

-- תמונות מודעות
create policy "listing_images_read_all" on listing_images for select using (true);
create policy "listing_images_insert_own" on listing_images for insert
  with check (exists (select 1 from listings where id = listing_id and user_id = auth.uid()));
create policy "listing_images_delete_own" on listing_images for delete
  using (exists (select 1 from listings where id = listing_id and user_id = auth.uid()));

-- שיחות: רק משתתפים
create policy "conversations_own" on conversations for all
  using (auth.uid() = participant_a or auth.uid() = participant_b);

-- מסרים: רק משתתפים בשיחה
create policy "messages_own" on messages for all
  using (exists (
    select 1 from conversations c
    where c.id = conversation_id
    and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
  ));

-- עוקבים: רק בעלים
create policy "follows_own" on follows for all using (auth.uid() = user_id);

-- התראות: רק בעלים
create policy "notifications_own" on notifications for all using (auth.uid() = user_id);

-- היסטוריית סטטוס: קריאה ציבורית
create policy "status_history_read" on listing_status_history for select using (true);
create policy "status_history_insert" on listing_status_history for insert
  with check (auth.uid() = changed_by);

-- ============================================================
-- פונקציות עזר
-- ============================================================

-- עדכון פרופיל אחרי יצירת מודעה
create or replace function update_profile_stats()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    update profiles set
      total_listings = total_listings + 1,
      total_giveaways = case when NEW.type = 'giveaway' then total_giveaways + 1 else total_giveaways end,
      updated_at = now()
    where id = NEW.user_id;
  elsif TG_OP = 'UPDATE' and NEW.status = 'completed' and OLD.status != 'completed' then
    update profiles set
      total_completed = total_completed + 1,
      updated_at = now()
    where id = NEW.user_id;
  end if;
  return NEW;
end;
$$;

create trigger trigger_update_profile_stats
  after insert or update on listings
  for each row execute function update_profile_stats();

-- עדכון דרגת פעילות
create or replace function update_user_rank()
returns trigger language plpgsql security definer as $$
begin
  update profiles set rank =
    case
      when NEW.total_completed >= 20 then 'hero'
      when NEW.total_completed >= 10 then 'contributor'
      when NEW.total_listings >= 3 then 'active_neighbor'
      else 'new_neighbor'
    end
  where id = NEW.id;
  return NEW;
end;
$$;

create trigger trigger_update_rank
  after update of total_listings, total_completed on profiles
  for each row execute function update_user_rank();

-- עדכון last_message בשיחה
create or replace function update_conversation_last_message()
returns trigger language plpgsql security definer as $$
declare
  conv conversations%rowtype;
begin
  select * into conv from conversations where id = NEW.conversation_id;

  update conversations set
    last_message_at = NEW.created_at,
    last_message_preview = left(NEW.content, 100),
    unread_a = case when conv.participant_b = NEW.sender_id then unread_a + 1 else unread_a end,
    unread_b = case when conv.participant_a = NEW.sender_id then unread_b + 1 else unread_b end
  where id = NEW.conversation_id;

  return NEW;
end;
$$;

create trigger trigger_update_conversation
  after insert on messages
  for each row execute function update_conversation_last_message();

-- פונקציה: קבל או צור שיחה
create or replace function get_or_create_conversation(
  p_listing_id uuid,
  p_other_user_id uuid
)
returns uuid language plpgsql security definer as $$
declare
  v_conversation_id uuid;
  v_current_user uuid := auth.uid();
  v_a uuid;
  v_b uuid;
begin
  -- ממיין UUID כדי למנוע שכפול
  if v_current_user < p_other_user_id then
    v_a := v_current_user;
    v_b := p_other_user_id;
  else
    v_a := p_other_user_id;
    v_b := v_current_user;
  end if;

  select id into v_conversation_id
  from conversations
  where listing_id = p_listing_id
    and participant_a = v_a
    and participant_b = v_b;

  if v_conversation_id is null then
    insert into conversations (listing_id, participant_a, participant_b)
    values (p_listing_id, v_a, v_b)
    returning id into v_conversation_id;
  end if;

  return v_conversation_id;
end;
$$;

-- פונקציה: איפוס ספירת הודעות שלא נקראו
create or replace function mark_conversation_read(p_conversation_id uuid)
returns void language plpgsql security definer as $$
declare
  conv conversations%rowtype;
begin
  select * into conv from conversations where id = p_conversation_id;

  update conversations set
    unread_a = case when participant_a = auth.uid() then 0 else unread_a end,
    unread_b = case when participant_b = auth.uid() then 0 else unread_b end
  where id = p_conversation_id;

  update messages set is_read = true
  where conversation_id = p_conversation_id
    and sender_id != auth.uid()
    and is_read = false;
end;
$$;

-- ============================================
-- GOODSPRINGS — Supabase Schema
-- Выполни этот SQL в Supabase → SQL Editor → New query → Run
-- ============================================

-- Новости
create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  author text default 'Администрация',
  date date default current_date,
  created_at timestamptz default now()
);

-- Доска объявлений
create table if not exists board (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text default 'Разное',
  author text default 'Житель',
  date date default current_date,
  status text default 'published',
  created_at timestamptz default now()
);

-- Недвижимость
create table if not exists housing (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  condition text default '',
  price text default '',
  status text default 'free', -- free | busy | repair
  created_at timestamptz default now()
);

-- Вакансии
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text default '',
  description text default '',
  requirements text default '',
  created_at timestamptz default now()
);

-- Мероприятия
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  date text default '',
  place text default 'Гудспрингс',
  status text default 'open',
  created_at timestamptz default now()
);

-- Предложения жителей
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  author text default 'Житель',
  status text default 'pending', -- pending | approved | rejected | done
  date date default current_date,
  created_at timestamptz default now()
);

-- Обращения к мэру
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  topic text default 'Другое',
  content text not null,
  status text default 'new', -- new | read | answered
  date date default current_date,
  created_at timestamptz default now()
);

-- Модерация (объявления до публикации)
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- board
  title text not null,
  content text not null,
  category text default 'Разное',
  author text default 'Аноним',
  status text default 'pending',
  created_at timestamptz default now()
);

-- Настройки (обращение мэра, о поселении, мета)
create table if not exists settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Администрация (команда)
create table if not exists admin_team (
  id text primary key,
  name text not null,
  role text not null,
  description text default '',
  photo text default '',
  sort_order int default 0
);

-- Стартовые данные
insert into settings (key, value) values
  ('meta', '{"name":"Goodsprings","motto":"Небольшое поселение в сердце Мохаве","mayor":"Рэй «Стальной Пулемёт» Дженкинс","population":"—","status":"Открыт для новых жителей","lastUpdate":""}'::jsonb),
  ('mayor_msg', '"Граждане и путешественники!\n\nГудспрингс открыт для новых жителей, торговцев и всех, кто устал от бесконечных скитаний по пустошам.\n\nМы не обещаем вам роскошь Нью-Вегаса, но у нас есть крыша над головой, возможность заработать и люди, которые не дадут вам умереть от скуки.\n\nС уважением,\nРэй Дженкинс,\nмэр Гудспрингс"'::jsonb),
  ('about', '{"history":"Гудспрингс — небольшое поселение в пустоши Мохаве. До войны это был тихий городок на пути через пустыню. После Великой войны выжившие постепенно вернули жизнь в старые дома и салун.\n\nСегодня Гудспрингс пытается оставаться одним из немногих относительно спокойных мест в регионе.","location":"Пустошь Мохаве, Невада. К северо-западу от Нью-Вегаса.","infrastructure":"Салун «Prospector», общий магазин, несколько жилых домов, теплицы, колодец.","rules":"1. Уважайте других жителей.\n2. Не начинайте конфликты внутри поселения без крайней необходимости.\n3. Торговля и сделки — на честных условиях.\n4. О любых угрозах со стороны пустоши сообщайте администрации.\n5. Новые жители регистрируются у мэра или его представителей.","opportunities":"Свободное жильё, работа, возможность участвовать в жизни поселения и предлагать улучшения."}'::jsonb)
on conflict (key) do nothing;

insert into admin_team (id, name, role, description, sort_order) values
  ('mayor', 'Рэй «Стальной Пулемёт» Дженкинс', 'Мэр Гудспрингс', 'Действующий мэр поселения. Отвечает за общее управление, безопасность и развитие Гудспрингс.', 0)
on conflict (id) do nothing;

-- Открытый доступ на чтение (для публичного сайта)
-- Запись разрешена всем с anon-ключом (для простоты малого RP-проекта).
-- При желании позже можно ужесточить через RLS + сервисный ключ только в админке.

alter table news enable row level security;
alter table board enable row level security;
alter table housing enable row level security;
alter table jobs enable row level security;
alter table events enable row level security;
alter table proposals enable row level security;
alter table messages enable row level security;
alter table submissions enable row level security;
alter table settings enable row level security;
alter table admin_team enable row level security;

-- Политики: читать и писать может любой (anon). Для маленького закрытого RP-сервера это нормально.
create policy "public_all_news" on news for all using (true) with check (true);
create policy "public_all_board" on board for all using (true) with check (true);
create policy "public_all_housing" on housing for all using (true) with check (true);
create policy "public_all_jobs" on jobs for all using (true) with check (true);
create policy "public_all_events" on events for all using (true) with check (true);
create policy "public_all_proposals" on proposals for all using (true) with check (true);
create policy "public_all_messages" on messages for all using (true) with check (true);
create policy "public_all_submissions" on submissions for all using (true) with check (true);
create policy "public_all_settings" on settings for all using (true) with check (true);
create policy "public_all_admin_team" on admin_team for all using (true) with check (true);
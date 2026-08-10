-- Run this once in the Supabase SQL editor.
-- Two tables and one storage bucket is the whole backend.

create extension if not exists "pgcrypto";

create table if not exists weddings (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  edit_token    uuid unique not null default gen_random_uuid(),
  is_published  boolean not null default false,
  theme         text not null default 'classic',
  primary_color text not null default '#8a6d3b',
  bg_color      text not null default '#fbf9f5',
  content       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists rsvps (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid not null references weddings(id) on delete cascade,
  guest_name  text not null,
  email       text,
  attending   boolean not null,
  party_size  int not null default 1,
  dietary     text,
  message     text,
  created_at  timestamptz not null default now()
);

create index if not exists rsvps_by_wedding on rsvps (wedding_id, created_at desc);

-- Every read and write goes through the Next.js server using the service-role
-- key, which bypasses RLS. Enabling RLS with no policies therefore changes
-- nothing for the app, and blocks anyone who finds the anon key from reading
-- the table directly. Belt and braces, one line each.
alter table weddings enable row level security;
alter table rsvps    enable row level security;

-- ─────────────────────────────────────────────────────────────
-- Storage: create a PUBLIC bucket named 'wedding-media' in the
-- Supabase dashboard (Storage → New bucket → Public).
-- Uploads are written server-side with the service-role key;
-- reads are plain public CDN URLs.
-- ─────────────────────────────────────────────────────────────

-- Later, when you add guest meal choices, nothing above has to change:
--
--   create table guest_meal_choices (
--     rsvp_id       uuid references rsvps(id) on delete cascade,
--     menu_item_id  text not null,   -- the stable id already stored in content->menu
--     primary key (rsvp_id, menu_item_id)
--   );

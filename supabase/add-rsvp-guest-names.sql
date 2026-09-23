-- Run once in the Supabase SQL editor before deploying the guest-name RSVP update.
alter table public.rsvps
  add column if not exists guest_names text[] not null default '{}'::text[];

-- Preserve existing replies by treating the original lead name as the guest list.
update public.rsvps
set guest_names = array[guest_name]
where cardinality(guest_names) = 0;

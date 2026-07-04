-- Optional local seed data for development.
-- Keep production access codes out of seed files.

insert into public.buyers (email, name, status)
values ('demo@example.com', 'Demo Buyer', 'demo')
on conflict (email) do nothing;

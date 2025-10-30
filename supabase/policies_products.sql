-- Ensure products table has public SELECT (already added), and create a policy to allow inserts only for approved sellers owning the auth session.
-- NOTE: run these in Supabase SQL editor (they require the auth.uid() function).

-- Allow anonymous users to SELECT (already done in init.sql) but keep it explicit:
create policy "public_select" on public.products
  for select using (true);

-- Allow inserts only when the authenticated user is the seller's auth_uid and the seller is approved.
create policy "seller_insert_if_approved" on public.products
  for insert
  with check (
    exists (
      select 1 from public.sellers s
      where s.id = products.seller_id
        and s.is_approved = true
        and s.auth_uid::text = auth.uid()::text
    )
  );

-- Optionally disallow direct updates/deletes by sellers, and restrict to admin role — adjust as needed.

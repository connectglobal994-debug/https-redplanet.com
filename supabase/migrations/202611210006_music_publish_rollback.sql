-- Allow authorized publishing staff to roll back an incomplete release safely.
drop policy if exists "release_staff_delete" on public.releases;
create policy "release_staff_delete" on public.releases
for delete to authenticated using(public.has_redplanet_role(array['administrator','editor']));
drop policy if exists "track_staff_delete" on public.tracks;
create policy "track_staff_delete" on public.tracks
for delete to authenticated using(public.has_redplanet_role(array['administrator','editor']));
grant delete on public.releases,public.tracks to authenticated;

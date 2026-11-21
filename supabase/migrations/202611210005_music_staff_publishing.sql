-- Staff publication permissions. All public visibility remains gated by releases.published.
drop policy if exists "release_staff_publish" on public.releases;
create policy "release_staff_publish" on public.releases
for insert to authenticated with check(public.has_redplanet_role(array['administrator','editor']));
drop policy if exists "release_staff_update" on public.releases;
create policy "release_staff_update" on public.releases
for update to authenticated using(public.has_redplanet_role(array['administrator','editor']))
with check(public.has_redplanet_role(array['administrator','editor']));
drop policy if exists "track_staff_publish" on public.tracks;
create policy "track_staff_publish" on public.tracks
for insert to authenticated with check(public.has_redplanet_role(array['administrator','editor']));
drop policy if exists "track_staff_update" on public.tracks;
create policy "track_staff_update" on public.tracks
for update to authenticated using(public.has_redplanet_role(array['administrator','editor']))
with check(public.has_redplanet_role(array['administrator','editor']));
grant insert,update on public.releases,public.tracks to authenticated;

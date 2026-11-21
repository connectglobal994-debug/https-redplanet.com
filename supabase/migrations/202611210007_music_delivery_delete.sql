-- Permit publishing staff to remove delivery files during rollback or takedown workflows.
drop policy if exists "music_staff_delivery_delete" on storage.objects;
create policy "music_staff_delivery_delete" on storage.objects
for delete to authenticated using(
  bucket_id='rp-music-public' and public.has_redplanet_role(array['administrator','editor'])
);

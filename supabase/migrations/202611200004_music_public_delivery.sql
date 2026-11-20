-- Public delivery is separate from private artist masters.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('rp-music-public','rp-music-public',false,104857600,
 array['audio/mpeg','audio/mp4','audio/aac','audio/wav','audio/x-wav','audio/flac','audio/ogg','audio/webm','audio/x-m4a','image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "published_music_delivery_read" on storage.objects;
create policy "published_music_delivery_read" on storage.objects
for select to anon,authenticated using(
 bucket_id='rp-music-public' and exists(
  select 1 from public.tracks t join public.releases r on r.id=t.release_id
  where r.published=true and t.audio_delivery_path=storage.objects.name
 )
);
drop policy if exists "music_staff_delivery_upload" on storage.objects;
create policy "music_staff_delivery_upload" on storage.objects
for insert to authenticated with check(
 bucket_id='rp-music-public' and public.has_redplanet_role(array['administrator','editor'])
);
drop policy if exists "music_staff_delivery_update" on storage.objects;
create policy "music_staff_delivery_update" on storage.objects
for update to authenticated using(
 bucket_id='rp-music-public' and public.has_redplanet_role(array['administrator','editor'])
) with check(
 bucket_id='rp-music-public' and public.has_redplanet_role(array['administrator','editor'])
);

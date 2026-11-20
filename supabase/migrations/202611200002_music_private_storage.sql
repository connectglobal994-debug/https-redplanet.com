-- Private artist master and artwork storage.
-- Apply after the core schema in the Red Planet DEVELOPMENT Supabase project.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'rp-music-private',
  'rp-music-private',
  false,
  52428800,
  array[
    'audio/mpeg','audio/mp4','audio/aac','audio/wav','audio/x-wav',
    'audio/flac','audio/ogg','audio/webm','audio/x-m4a',
    'image/jpeg','image/png','image/webp'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "artist_upload_own_music_files" on storage.objects;
create policy "artist_upload_own_music_files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'rp-music-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "artist_read_own_music_files" on storage.objects;
create policy "artist_read_own_music_files"
on storage.objects for select to authenticated
using (
  bucket_id = 'rp-music-private'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.has_redplanet_role(array['administrator','moderator','editor'])
  )
);

drop policy if exists "artist_delete_own_music_files" on storage.objects;
create policy "artist_delete_own_music_files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'rp-music-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Create public storage bucket for product images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,  -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do nothing;

-- Allow public read access to product images
create policy "Public read product images"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

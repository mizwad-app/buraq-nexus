INSERT INTO public.category_exhibitions (category_slug, exhibition_id, is_primary)
SELECT 'vehicle_parts', e.id, true
FROM public.exhibitions e
WHERE e.slug IN (
  'automechanika-frankfurt',
  'automechanika-shanghai',
  'automechanika-istanbul',
  'automechanika-dubai',
  'aapex-las-vegas',
  'sema-show',
  'mims-automobility',
  'equip-auto-paris'
)
ON CONFLICT (category_slug, exhibition_id) DO NOTHING;
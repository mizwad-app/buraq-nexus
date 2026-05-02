
-- 1) Delete duplicates in travel_checklist_items, keeping earliest row per (user_id, item_name)
DELETE FROM travel_checklist_items a
USING travel_checklist_items b
WHERE a.user_id = b.user_id
  AND a.item_name = b.item_name
  AND a.created_at > b.created_at;

-- 2) Delete legacy items not in the official 10-item list
DELETE FROM travel_checklist_items
WHERE is_default = true
  AND item_name NOT IN (
    'passport','cantonFairBadge','visaCard','powerBank','toothbrush',
    'perfume','hairbrush','neckPillow','simCard','pen'
  );

-- 3) Remove duplicate shopping malls (Chinese-script duplicates of English-named ones)
DELETE FROM shopping_malls
WHERE name IN ('天河城','太古汇','正佳广场');

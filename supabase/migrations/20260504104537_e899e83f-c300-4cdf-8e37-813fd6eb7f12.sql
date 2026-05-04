BEGIN;

-- Backfill coordinates onto admin_verified rows from legacy duplicates
UPDATE mosques SET latitude = 23.1291, longitude = 113.2644
  WHERE id = '01e7b1e2-19dc-4d08-a53e-62db3baf5b6b';

UPDATE mosques SET latitude = 23.1285, longitude = 113.2698
  WHERE id = 'f7991d97-44a7-4621-bee2-cbb7866cbe49';

UPDATE mosques SET latitude = 29.3086, longitude = 120.0754
  WHERE id = '383e79d7-5f1e-4219-8be1-23dcbb53d2b3' AND latitude IS NULL;

-- Delete legacy duplicates (unverified rows)
DELETE FROM mosques WHERE id IN (
  'b586d3f3-8389-4954-84f3-76fda6123b86',
  '6280ac59-994b-46f1-acdb-e1026756e628',
  'e433d568-09e4-4854-bbe0-61383f1b61b9',
  '1bcdeaaf-91c6-4d34-b60d-272f47ee8c58'
);

COMMIT;
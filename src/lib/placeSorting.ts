export interface SortablePlace {
  verification_status?: string | null;
  phone?: string | null;
  data_sources?: unknown;
  name?: string | null;
  name_en?: string | null;
}

export const getQualityTier = (p: SortablePlace): number => {
  if (p.verification_status === 'admin_verified') return 1;
  if (p.verification_status === 'community_verified') return 2;
  const hasPhone = !!p.phone?.trim();
  const hasSources = Array.isArray(p.data_sources) && p.data_sources.length > 0;
  if (p.verification_status === 'unverified' && (hasPhone || hasSources)) return 3;
  if (p.verification_status === 'unverified') return 4;
  return 5;
};

export const sortByQuality = <T extends SortablePlace>(a: T, b: T): number => {
  const tierDiff = getQualityTier(a) - getQualityTier(b);
  if (tierDiff !== 0) return tierDiff;
  return (a.name_en || a.name || '').localeCompare(b.name_en || b.name || '');
};

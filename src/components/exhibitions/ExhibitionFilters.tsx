import { LocationFilterChips } from "./LocationFilterChips";
import { CategoryFilterDropdown } from "./CategoryFilterDropdown";
import type { LocationFilter } from "@/hooks/useExhibitions";

export interface FilterState {
  location: LocationFilter;
  categoryId: number | null;
}

interface Props {
  value: FilterState;
  onChange: (val: FilterState) => void;
  counts?: { all: number; international: number; domestic: number };
}

export function ExhibitionFilters({ value, onChange, counts }: Props) {
  return (
    <div className="space-y-2.5">
      <LocationFilterChips
        value={value.location}
        onChange={(loc) => onChange({ ...value, location: loc })}
        counts={counts}
      />
      <CategoryFilterDropdown
        value={value.categoryId}
        onChange={(cat) => onChange({ ...value, categoryId: cat })}
      />
    </div>
  );
}

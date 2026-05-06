import { useNavigate } from "react-router-dom";

interface Props {
  emoji?: string | null;
  name: string;
}

export const CategoryBadge = ({ emoji, name }: Props) => {
  const navigate = useNavigate();
  return (
    <section className="px-5 mb-4">
      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-[10px] py-2 px-3">
        <span className="text-base">{emoji ?? "📦"}</span>
        <span className="flex-1 text-sm font-medium text-foreground">{name}</span>
        <button onClick={() => navigate(-1)} className="text-[11px] text-muted-foreground underline">
          o'zgartirish
        </button>
      </div>
    </section>
  );
};

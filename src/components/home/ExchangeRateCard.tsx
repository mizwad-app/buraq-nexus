import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Coins } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const ExchangeRateCard = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const rates = [
    { left: "1 USD", right: "7.24 ¥" },
    { left: "1 ¥", right: "1,720 so'm" },
    { left: "1 USD", right: "12,460 so'm" },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-left w-full rounded-2xl p-4 min-h-[120px] bg-amber-900/30 border border-amber-700/40 transition-transform active:scale-[0.98]"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-amber-200">
            <Coins className="w-4 h-4" />
            <span className="text-xs font-medium">{t("home.exchangeRates")}</span>
          </div>
          <span className="text-[11px] text-amber-200/70 bg-amber-950/40 px-2 py-0.5 rounded-full">
            {t("home.updatedToday")}
          </span>
        </div>

        <div className="space-y-1.5">
          {rates.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{r.left}</span>
              <span className="font-mono text-foreground">{r.right}</span>
            </div>
          ))}
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("home.exchangeInfo.title")}</DialogTitle>
            <DialogDescription>{t("home.exchangeInfo.body")}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

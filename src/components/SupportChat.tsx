import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Brand icons as SVG components
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

interface SupportChatProps {
  className?: string;
  contextMessage?: string; // Pre-filled message for context
}

export const SupportChat = ({ className, contextMessage }: SupportChatProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Contact configuration
  const WHATSAPP_NUMBER = "+8613800138000"; // Replace with actual number
  const TELEGRAM_USERNAME = "halaltrade_support"; // Replace with actual username

  const openWhatsApp = () => {
    const message = contextMessage 
      ? encodeURIComponent(contextMessage)
      : encodeURIComponent(t("support.defaultMessage"));
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${message}`, '_blank');
    setIsOpen(false);
  };

  const openTelegram = () => {
    const message = contextMessage 
      ? encodeURIComponent(contextMessage)
      : encodeURIComponent(t("support.defaultMessage"));
    window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${message}`, '_blank');
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className={cn(
            "fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full",
            "bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30",
            "flex items-center justify-center",
            "hover:scale-110 active:scale-95 transition-all duration-200",
            "animate-bounce-subtle",
            className
          )}
          aria-label={t("support.title")}
        >
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-auto rounded-t-3xl px-5 pb-8">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl font-display text-center">
            {t("support.title")}
          </SheetTitle>
          <p className="text-sm text-muted-foreground text-center">
            {t("support.subtitle")}
          </p>
        </SheetHeader>

        <div className="space-y-3">
          {/* WhatsApp Button */}
          <button
            onClick={openWhatsApp}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
              <WhatsAppIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-foreground">WhatsApp</p>
              <p className="text-sm text-muted-foreground">
                {t("support.whatsappDesc")}
              </p>
            </div>
          </button>

          {/* Telegram Button */}
          <button
            onClick={openTelegram}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center flex-shrink-0">
              <TelegramIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-foreground">Telegram</p>
              <p className="text-sm text-muted-foreground">
                {t("support.telegramDesc")}
              </p>
            </div>
          </button>
        </div>

        {/* Context info if available */}
        {contextMessage && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">{t("support.inquiryAbout")}:</p>
            <p className="text-sm text-foreground line-clamp-2">{contextMessage}</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

// Inline "Ask Agent" button for market detail cards
interface AskAgentButtonProps {
  marketName: string;
  className?: string;
}

export const AskAgentButton = ({ marketName, className }: AskAgentButtonProps) => {
  const { t } = useTranslation();
  
  const WHATSAPP_NUMBER = "+8613800138000";
  const TELEGRAM_USERNAME = "halaltrade_support";
  
  const [showOptions, setShowOptions] = useState(false);
  
  const contextMessage = t("support.marketInquiry", { market: marketName });
  
  const openWhatsApp = () => {
    const message = encodeURIComponent(contextMessage);
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${message}`, '_blank');
    setShowOptions(false);
  };

  const openTelegram = () => {
    const message = encodeURIComponent(contextMessage);
    window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${message}`, '_blank');
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg",
          "bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium",
          "transition-all",
          className
        )}
      >
        <MessageCircle className="w-4 h-4" />
        {t("support.askAgent")}
      </button>
      
      {showOptions && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowOptions(false)} 
          />
          <div className="absolute bottom-full right-0 mb-2 z-50 bg-card rounded-lg shadow-lg border border-border overflow-hidden min-w-[160px]">
            <button
              onClick={openWhatsApp}
              className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-muted/50 transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span className="text-sm">WhatsApp</span>
            </button>
            <button
              onClick={openTelegram}
              className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-muted/50 transition-colors"
            >
              <TelegramIcon className="w-4 h-4 text-[#0088cc]" />
              <span className="text-sm">Telegram</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

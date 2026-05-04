import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Shield, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacyModal = ({ open, onOpenChange }: PrivacyModalProps) => {
  const { t } = useTranslation();

  const Section = ({
    icon,
    title,
    items,
    iconColor,
  }: {
    icon: React.ReactNode;
    title: string;
    items: string[];
    iconColor: string;
  }) => (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
        <span className={iconColor}>{icon}</span>
        {title}
      </h4>
      <ul className="space-y-1.5 pl-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className={`mt-0.5 shrink-0 ${iconColor}`}>
              {iconColor.includes("destructive") ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {t("onboarding.privacy.title")}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-5 py-2">
            <Section
              icon={<Check className="w-4 h-4" />}
              iconColor="text-primary"
              title={t("onboarding.privacy.what_we_do")}
              items={[
                t("onboarding.privacy.what_we_do_items.personalize"),
                t("onboarding.privacy.what_we_do_items.notify"),
                t("onboarding.privacy.what_we_do_items.anonymous_analytics"),
              ]}
            />
            <Section
              icon={<X className="w-4 h-4" />}
              iconColor="text-destructive"
              title={t("onboarding.privacy.what_we_dont_do")}
              items={[
                t("onboarding.privacy.what_we_dont_do_items.no_sell"),
                t("onboarding.privacy.what_we_dont_do_items.no_advertisers"),
                t("onboarding.privacy.what_we_dont_do_items.no_share_users"),
                t("onboarding.privacy.what_we_dont_do_items.no_spam"),
              ]}
            />
            <Section
              icon={<Shield className="w-4 h-4" />}
              iconColor="text-primary"
              title={t("onboarding.privacy.security")}
              items={[
                t("onboarding.privacy.security_items.encrypted"),
                t("onboarding.privacy.security_items.limited_access"),
                t("onboarding.privacy.security_items.gdpr"),
              ]}
            />
            <Section
              icon={<UserCheck className="w-4 h-4" />}
              iconColor="text-primary"
              title={t("onboarding.privacy.your_rights")}
              items={[
                t("onboarding.privacy.rights_items.edit"),
                t("onboarding.privacy.rights_items.delete"),
                t("onboarding.privacy.rights_items.export"),
              ]}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

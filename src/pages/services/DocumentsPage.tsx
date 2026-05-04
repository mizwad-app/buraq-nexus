import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ServicePageShell } from "./ServicePageShell";

const DocumentsPage = () => {
  const { t } = useTranslation();
  return (
    <ServicePageShell title={t("services.cards.documents.title")} subtitle={t("services.cards.documents.subtitle")}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{t("travel.tabs.documents")}</CardTitle>
              <CardDescription>{t("travel.documentsDescription") || "Sayohat uchun kerakli hujjatlar"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("travel.documentsComingSoon") || "Tez orada qo'shiladi."}</p>
        </CardContent>
      </Card>
    </ServicePageShell>
  );
};

export default DocumentsPage;

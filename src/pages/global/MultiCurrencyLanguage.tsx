import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", flag: "🇦🇪" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
];

const currencies = [
  { code: "USD", symbol: "$", rate: 1 },
  { code: "INR", symbol: "₹", rate: 83.2 },
  { code: "EUR", symbol: "€", rate: 0.92 },
  { code: "AED", symbol: "د.إ", rate: 3.67 },
  { code: "GBP", symbol: "£", rate: 0.79 },
  { code: "JPY", symbol: "¥", rate: 149.5 },
];

const samplePrices = [
  { item: "Teleconsultation", baseUSD: 25 },
  { item: "Panchakarma Package", baseUSD: 150 },
  { item: "Monthly Subscription", baseUSD: 9.99 },
];

export default function MultiCurrencyLanguage() {
  const [selectedLang, setSelectedLang] = useState("en");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const activeCurrency = currencies.find((c) => c.code === selectedCurrency)!;

  const handleSave = () => {
    toast.success(`Preferences saved: ${selectedLang.toUpperCase()} / ${selectedCurrency}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold">Language & Currency Settings</h1>
      <p className="text-muted-foreground">Personalize your Ayuzee experience for your region.</p>

      <Card>
        <CardHeader><CardTitle>Select Language</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={selectedLang === lang.code ? "default" : "outline"}
              onClick={() => setSelectedLang(lang.code)}
            >
              <span className="mr-2 text-lg">{lang.flag}</span> {lang.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Select Currency</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {currencies.map((cur) => (
            <Button
              key={cur.code}
              variant={selectedCurrency === cur.code ? "default" : "outline"}
              onClick={() => setSelectedCurrency(cur.code)}
            >
              {cur.symbol} {cur.code}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Price Preview</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {samplePrices.map((item) => (
              <div key={item.item} className="flex justify-between items-center border-b pb-2">
                <span>{item.item}</span>
                <Badge variant="secondary">
                  {activeCurrency.symbol}{(item.baseUSD * activeCurrency.rate).toFixed(2)} {selectedCurrency}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full" size="lg">Save Preferences</Button>
    </div>
  );
}

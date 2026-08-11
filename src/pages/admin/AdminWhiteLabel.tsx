import { useState } from "react";
import { Paintbrush, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface WhiteLabelConfig {
  tenant_name: string;
  primary_color: string;
  logo_url: string;
  favicon_url: string;
  custom_domain: string;
  footer_text: string;
  support_email: string;
  whatsapp_number: string;
}

const defaultConfig: WhiteLabelConfig = {
  tenant_name: "Ayuzee",
  primary_color: "#16a34a",
  logo_url: "",
  favicon_url: "",
  custom_domain: "",
  footer_text: "India's #1 AYUSH Aggregator Platform",
  support_email: "",
  whatsapp_number: "",
};

export default function AdminWhiteLabel() {
  const [config, setConfig] = useState<WhiteLabelConfig>(defaultConfig);
  const [previewOpen, setPreviewOpen] = useState(false);

  const updateConfig = (key: keyof WhiteLabelConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const saveConfig = () => {
    localStorage.setItem("whitelabel_config", JSON.stringify(config));
    toast.success("White-label config saved");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Paintbrush className="h-6 w-6" />
          White-label Config
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure branding for platform tenants
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-lg"
              style={{ backgroundColor: config.primary_color }}
            />
            <div>
              <p className="font-medium">
                {config.tenant_name} (Default)
              </p>
              <p className="text-sm text-muted-foreground">Current Tenant</p>
            </div>
            <Badge variant="default" className="ml-auto">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tenant Name</Label>
              <Input
                value={config.tenant_name}
                onChange={(e) => updateConfig("tenant_name", e.target.value)}
              />
            </div>
            <div>
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.primary_color}
                  onChange={(e) => updateConfig("primary_color", e.target.value)}
                  className="w-14 h-10 p-1"
                />
                <Input
                  value={config.primary_color}
                  onChange={(e) => updateConfig("primary_color", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input
                value={config.logo_url}
                onChange={(e) => updateConfig("logo_url", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <Label>Favicon URL</Label>
              <Input
                value={config.favicon_url}
                onChange={(e) => updateConfig("favicon_url", e.target.value)}
                placeholder="https://example.com/favicon.ico"
              />
            </div>
            <div>
              <Label>Custom Domain</Label>
              <Input
                value={config.custom_domain}
                onChange={(e) => updateConfig("custom_domain", e.target.value)}
                placeholder="yourname.ayuzee.com"
              />
            </div>
            <div>
              <Label>Footer Text</Label>
              <Input
                value={config.footer_text}
                onChange={(e) => updateConfig("footer_text", e.target.value)}
              />
            </div>
            <div>
              <Label>Support Email</Label>
              <Input
                type="email"
                value={config.support_email}
                onChange={(e) => updateConfig("support_email", e.target.value)}
                placeholder="support@yourdomain.com"
              />
            </div>
            <div>
              <Label>WhatsApp Number</Label>
              <Input
                value={config.whatsapp_number}
                onChange={(e) => updateConfig("whatsapp_number", e.target.value)}
                placeholder="+91XXXXXXXXXX"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Brand Preview</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div
                    className="p-6 rounded-lg text-white"
                    style={{ backgroundColor: config.primary_color }}
                  >
                    <h2 className="text-xl font-bold">{config.tenant_name}</h2>
                    <p className="text-sm opacity-90">{config.footer_text}</p>
                  </div>
                  {config.logo_url && (
                    <div className="border rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-2">Logo Preview:</p>
                      <img
                        src={config.logo_url}
                        alt="Logo"
                        className="max-h-12"
                      />
                    </div>
                  )}
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Domain:</span> {config.custom_domain || "Not configured"}</p>
                    <p><span className="font-medium">Support:</span> {config.support_email || "Not configured"}</p>
                    <p><span className="font-medium">WhatsApp:</span> {config.whatsapp_number || "Not configured"}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={saveConfig}>
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">White-label Mode</p>
              <p className="text-sm text-muted-foreground">
                White-label mode must be enabled in Feature Flags to activate
              </p>
            </div>
            <Badge variant="secondary">Disabled</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Monitor, Volume2, RefreshCw, Maximize, Settings } from "lucide-react";

type TokenDisplay = { tokenNo: number; patientName: string; department: string; doctor: string; room: string; status: "calling" | "waiting" | "in_progress" };

const mockTokens: TokenDisplay[] = [
  { tokenNo: 15, patientName: "Ramesh K.", department: "Ayurveda", doctor: "Dr. Arun Sharma", room: "Room 101", status: "calling" },
  { tokenNo: 16, patientName: "Lakshmi D.", department: "Panchakarma", doctor: "Dr. Meena Patel", room: "Room 102", status: "in_progress" },
  { tokenNo: 17, patientName: "Sunil M.", department: "Ayurveda", doctor: "Dr. Arun Sharma", room: "Room 101", status: "waiting" },
  { tokenNo: 18, patientName: "Meera N.", department: "Homeopathy", doctor: "Dr. Priya Das", room: "Room 201", status: "waiting" },
  { tokenNo: 19, patientName: "Anand S.", department: "Siddha", doctor: "Dr. Tamil Selvan", room: "Room 202", status: "waiting" },
  { tokenNo: 20, patientName: "Priya K.", department: "Ayurveda", doctor: "Dr. Arun Sharma", room: "Room 101", status: "waiting" },
  { tokenNo: 21, patientName: "Mohan R.", department: "Yoga", doctor: "Dr. Ananya S", room: "Yoga Hall", status: "waiting" },
  { tokenNo: 22, patientName: "Kavitha S.", department: "Panchakarma", doctor: "Dr. Meena Patel", room: "Room 102", status: "waiting" },
];

const HmsQueueDisplay = () => {
  const [tokens] = useState<TokenDisplay[]>(mockTokens);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calling = tokens.filter(t => t.status === "calling");
  const waiting = tokens.filter(t => t.status === "waiting");

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Monitor className="h-6 w-6 text-blue-600" /> Queue Display (TV Screen)
          </h1>
          <p className="text-sm text-muted-foreground">Public display for patient queue · Auto-refresh · Voice announcement · Multi-language</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="ayurveda">Ayurveda</SelectItem>
              <SelectItem value="panchakarma">Panchakarma</SelectItem>
              <SelectItem value="homeopathy">Homeopathy</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => toast.info("Voice announcement enabled")}><Volume2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}><Maximize className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Display Screen Preview */}
      <Card className="bg-slate-900 text-white border-0 overflow-hidden">
        <CardContent className="p-0">
          {/* Header Bar */}
          <div className="bg-primary px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center">
                <span className="text-sm font-bold">A</span>
              </div>
              <div>
                <p className="font-display font-bold text-lg">Ayuzee AYUSH Hospital</p>
                <p className="text-xs text-white/70">OPD Token Display</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono font-bold">{currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
              <p className="text-xs text-white/70">{currentTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</p>
            </div>
          </div>

          {/* Now Calling - Large */}
          <div className="px-6 py-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-b border-white/10">
            <p className="text-xs text-green-300 uppercase tracking-wider mb-2">Now Calling</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {calling.map(t => (
                <div key={t.tokenNo} className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-bold text-green-300">#{t.tokenNo}</p>
                      <p className="text-lg font-medium mt-1">{t.patientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-300">{t.doctor}</p>
                      <p className="text-sm text-white/70">{t.room}</p>
                      <Badge className="bg-green-500/30 text-green-200 mt-1">{t.department}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Waiting Queue */}
          <div className="px-6 py-4">
            <p className="text-xs text-blue-300 uppercase tracking-wider mb-3">Waiting Queue</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {waiting.map(t => (
                <div key={t.tokenNo} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-blue-300">#{t.tokenNo}</p>
                    <Badge className="bg-blue-500/20 text-blue-200 text-[10px]">{t.department}</Badge>
                  </div>
                  <p className="text-sm text-white/80 mt-1">{t.patientName}</p>
                  <p className="text-xs text-white/50">{t.doctor} · {t.room}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white/5 px-6 py-2 flex items-center justify-between text-xs text-white/40">
            <span>Auto-refresh: 5 seconds</span>
            <span>Voice: English + Malayalam</span>
            <span>Total waiting: {waiting.length}</span>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        This screen is designed for TV/large display in waiting area. Click fullscreen button for actual display mode.
      </p>
    </div>
  );
};

export default HmsQueueDisplay;

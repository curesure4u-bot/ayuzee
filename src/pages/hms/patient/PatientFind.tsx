import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search, Brain, Sparkles, UserPlus, Loader2,
  Receipt, CheckCircle, MoreHorizontal, Calendar,
} from "lucide-react";
import { aiSmartSearch } from "@/services/patientAiService";
import type { PatientSearchResult } from "@/types/patient-hms";

// Mock patient data for demonstration
const mockPatients: PatientSearchResult[] = [
  { sNo: 1, id: "AL-14181", name: "Mr. Kubbusamy", dobAge: "--- / 45 years", phone: "9526279356", registrationDate: "27/11/2025", address: "SURANDAI", groupTag: "SURANDAI" },
  { sNo: 2, id: "AL-14227", name: "Mr. Suresh 21422", dobAge: "--- / 30 years", phone: "7502899214", registrationDate: "05/12/2025", address: "SURANDAI", groupTag: "SURANDAI" },
  { sNo: 3, id: "AL-14259", name: "Stalin 21435", dobAge: "--- / 29 years", phone: "8124616118", registrationDate: "09/12/2025", address: "SURANDAI", groupTag: "SURANDAI" },
  { sNo: 4, id: "AL-14317", name: "Mrs. Chellathai 21476", dobAge: "--- / 67 years", phone: "9790117288", registrationDate: "18/12/2025", address: "SURANDAI", groupTag: "SURANDAI" },
  { sNo: 5, id: "AL-14335", name: "Mrs. Raja Pushbam 21488", dobAge: "--- / 40 years", phone: "9791252131", registrationDate: "22/12/2025", address: "SURANDAI", groupTag: "SURANDAI" },
  { sNo: 6, id: "AL-14429", name: "Mr. Paul Jeya Nirmal 21539", dobAge: "--- / 28 years", phone: "9629699566", registrationDate: "05/01/2026", address: "SURANDAI", groupTag: "SURANDAI" },
  { sNo: 7, id: "AL-14571", name: "Mr. Nagarajan21618", dobAge: "--- / 50 years", phone: "6383058606", registrationDate: "26/01/2026", address: "SURANDAI", groupTag: "SURANDAI" },
  { sNo: 8, id: "AL-14572", name: "Mrs. Swetha", dobAge: "--- / ---", phone: "6383058606", registrationDate: "26/01/2026", address: "SURANDAI", groupTag: ".surandai" },
  { sNo: 9, id: "AL-14577", name: "Master. Devesh 21622", dobAge: "--- / 11 years", phone: "9790117288", registrationDate: "26/01/2026", address: "SURANDAI", groupTag: "SURANDAI" },
  { sNo: 10, id: "AL-14613", name: "Mr. Rajeswari21647", dobAge: "--- / 42 years", phone: "9952462867", registrationDate: "31/01/2026", address: "SURANDAI", groupTag: "SURANDAI" },
];

const PatientFind = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [aiHint, setAiHint] = useState("");
  const [selectedActions, setSelectedActions] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return toast.error("Enter ID, Name, or Mobile to search");

    setLoading(true);
    setSearched(true);

    // AI smart search classification
    const aiResult = await aiSmartSearch(query);
    setAiHint(aiResult.suggestion);

    // Simulate search
    await new Promise((r) => setTimeout(r, 600));

    const filtered = mockPatients.filter((p) => {
      const q = query.toLowerCase();
      return (
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.address ?? "").toLowerCase().includes(q)
      );
    });

    setResults(filtered.length > 0 ? filtered : mockPatients.slice(0, 5));
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleQuickBill = (patient: PatientSearchResult) => {
    toast.success(`Quick Bill for ${patient.name}`, {
      description: `Opening billing for ${patient.id}`,
    });
  };

  const handleCheckin = (patient: PatientSearchResult) => {
    toast.success(`${patient.name} checked in`, {
      description: `Token generated for ${patient.id}`,
    });
  };

  const handleBookTherapy = (patient: PatientSearchResult) => {
    toast.success(`Book Therapy for ${patient.name}`, {
      description: `Opening therapy scheduler for ${patient.id}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6 text-orange-600" /> Find Patient
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Brain className="h-3 w-3" /> AI-powered search by ID, Name, or Mobile
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border-2 border-sky-200">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-sky-600">Find Patient</h2>
          </div>
          <div className="flex gap-2 max-w-lg mx-auto">
            <div className="flex-1 relative">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ID or Name or Mobile"
                className="pr-10 h-10"
              />
              {aiHint && (
                <span className="absolute -bottom-5 left-0 text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-violet-500" /> {aiHint}
                </span>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 h-10 px-6"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && !loading && results.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No patients found.</p>
            <Button
              variant="link"
              className="text-orange-600 mt-2"
              onClick={() => toast.info("Navigate to Register Patient")}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Not able to find Patient? Click here to register new Patient
            </Button>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="flex justify-end p-3">
              <span className="text-sm text-orange-600 hover:underline cursor-pointer">
                <UserPlus className="h-3 w-3 inline mr-1" />
                Not able to find Patient? Click here to register new Patient
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold text-orange-700">S.No</th>
                    <th className="px-3 py-3 text-left font-semibold text-orange-700">ID</th>
                    <th className="px-3 py-3 text-left font-semibold text-orange-700">External ID</th>
                    <th className="px-3 py-3 text-left font-semibold text-orange-700">Name</th>
                    <th className="px-3 py-3 text-left font-semibold text-orange-700">DOB/Age</th>
                    <th className="px-3 py-3 text-left font-semibold text-orange-700">Credit Info</th>
                    <th className="px-3 py-3 text-left font-semibold text-orange-700">Phone</th>
                    <th className="px-3 py-3 text-left font-semibold text-orange-700">Registration Date</th>
                    <th className="px-3 py-3 text-left font-semibold text-orange-700">Address</th>
                    <th className="px-3 py-3 text-left font-semibold text-orange-700">Group/Tag</th>
                    <th className="px-3 py-3 text-left font-semibold text-orange-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((patient) => (
                    <tr key={patient.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-3">{patient.sNo}</td>
                      <td className="px-3 py-3 font-medium">{patient.id}</td>
                      <td className="px-3 py-3 text-muted-foreground">{patient.externalId ?? ""}</td>
                      <td className="px-3 py-3 font-medium">{patient.name}</td>
                      <td className="px-3 py-3">{patient.dobAge}</td>
                      <td className="px-3 py-3">{patient.creditInfo ?? ""}</td>
                      <td className="px-3 py-3">{patient.phone}</td>
                      <td className="px-3 py-3">{patient.registrationDate}</td>
                      <td className="px-3 py-3">{patient.address}</td>
                      <td className="px-3 py-3">{patient.groupTag ?? ""}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="h-6 text-xs bg-green-600 hover:bg-green-700 px-2"
                              onClick={() => handleQuickBill(patient)}
                            >
                              <Receipt className="h-3 w-3 mr-1" /> Quick Bill
                            </Button>
                            <Button
                              size="sm"
                              className="h-6 text-xs bg-orange-500 hover:bg-orange-600 px-2"
                              onClick={() => handleCheckin(patient)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" /> Checkin
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs px-2"
                              onClick={() => setSelectedActions(selectedActions === patient.id ? null : patient.id)}
                            >
                              More <MoreHorizontal className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs text-green-700 border-green-300 px-2"
                            onClick={() => handleBookTherapy(patient)}
                          >
                            <Calendar className="h-3 w-3 mr-1" /> + Book Therapy
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientFind;

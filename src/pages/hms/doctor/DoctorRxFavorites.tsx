import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Heart,
  Plus,
  Search,
  Pill,
  Copy,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Brain,
  Star,
} from "lucide-react";

interface Medicine {
  name: string;
  dose: string;
  frequency: string;
}

interface Favorite {
  id: string;
  name: string;
  medicinesCount: number;
  condition: string;
  lastUsed: string;
  timesUsed: number;
  medicines: Medicine[];
}

const favorites: Favorite[] = [
  {
    id: "1",
    name: "My RA Protocol",
    medicinesCount: 4,
    condition: "Amavata / RA",
    lastUsed: "Today",
    timesUsed: 47,
    medicines: [
      { name: "Simhanada Guggulu", dose: "2 tabs", frequency: "BD" },
      { name: "Rasnasaptakam Kashayam", dose: "15ml", frequency: "BD" },
      { name: "Kottamchukkadi Taila", dose: "QS", frequency: "External" },
      { name: "Ashwagandha Churna", dose: "3g", frequency: "HS" },
    ],
  },
  {
    id: "2",
    name: "Diabetes Standard",
    medicinesCount: 5,
    condition: "Madhumeha / Type 2 DM",
    lastUsed: "Yesterday",
    timesUsed: 62,
    medicines: [
      { name: "Nishamalaki Churna", dose: "3g", frequency: "BD" },
      { name: "Chandraprabha Vati", dose: "2 tabs", frequency: "BD" },
      { name: "Shilajatu Rasayana", dose: "250mg", frequency: "BD" },
      { name: "Jambu Beeja Churna", dose: "2g", frequency: "BD" },
      { name: "Gudmar (Meshashringi)", dose: "500mg", frequency: "BD" },
    ],
  },
  {
    id: "3",
    name: "Sciatica Combo",
    medicinesCount: 5,
    condition: "Gridhrasi / Sciatica",
    lastUsed: "2 days ago",
    timesUsed: 34,
    medicines: [
      { name: "Yogaraja Guggulu", dose: "2 tabs", frequency: "BD" },
      { name: "Rasnadi Kashayam", dose: "15ml", frequency: "BD" },
      { name: "Mahanarayana Taila", dose: "QS", frequency: "External" },
      { name: "Dashamoola Kwath", dose: "20ml", frequency: "BD" },
      { name: "Eranda Taila", dose: "10ml", frequency: "HS (weekly)" },
    ],
  },
  {
    id: "4",
    name: "Panchakarma Pre-prep",
    medicinesCount: 3,
    condition: "Purvakarma / Detox Prep",
    lastUsed: "3 days ago",
    timesUsed: 28,
    medicines: [
      { name: "Pachana — Chitrakadi Vati", dose: "2 tabs", frequency: "TDS" },
      { name: "Snehapana — Mahatikta Ghrita", dose: "Increasing", frequency: "OD (morning)" },
      { name: "Deepana — Trikatu Churna", dose: "1g", frequency: "BD before food" },
    ],
  },
  {
    id: "5",
    name: "Post-PK Rasayana",
    medicinesCount: 4,
    condition: "Paschat Karma / Rejuvenation",
    lastUsed: "5 days ago",
    timesUsed: 22,
    medicines: [
      { name: "Chyawanprash", dose: "10g", frequency: "BD" },
      { name: "Ashwagandha Rasayana", dose: "5g", frequency: "HS with milk" },
      { name: "Brahma Rasayana", dose: "5g", frequency: "OD morning" },
      { name: "Draksha (Grapes)", dose: "As snack", frequency: "Daily" },
    ],
  },
  {
    id: "6",
    name: "Thyroid Support",
    medicinesCount: 4,
    condition: "Galaganda / Hypothyroid",
    lastUsed: "1 week ago",
    timesUsed: 19,
    medicines: [
      { name: "Kanchanara Guggulu", dose: "2 tabs", frequency: "BD" },
      { name: "Varunadi Kashayam", dose: "15ml", frequency: "BD" },
      { name: "Punarnava Mandoor", dose: "2 tabs", frequency: "BD" },
      { name: "Shigru (Moringa) Churna", dose: "3g", frequency: "OD" },
    ],
  },
  {
    id: "7",
    name: "Immunity Boost",
    medicinesCount: 4,
    condition: "Vyadhikshamatva / General Immunity",
    lastUsed: "1 week ago",
    timesUsed: 38,
    medicines: [
      { name: "Chyawanprash", dose: "10g", frequency: "BD" },
      { name: "Giloy Ghanvati", dose: "2 tabs", frequency: "BD" },
      { name: "Tulasi Ark", dose: "5ml", frequency: "OD" },
      { name: "Haldi (Turmeric) Milk", dose: "200ml", frequency: "HS" },
    ],
  },
  {
    id: "8",
    name: "Pain Relief (Acute)",
    medicinesCount: 4,
    condition: "Shoola / Acute Pain",
    lastUsed: "Today",
    timesUsed: 55,
    medicines: [
      { name: "Maharasnadi Kashayam", dose: "15ml", frequency: "BD" },
      { name: "Lakshadi Guggulu", dose: "2 tabs", frequency: "TDS" },
      { name: "Vishagarbha Taila", dose: "QS", frequency: "External" },
      { name: "Shallaki (Boswellia)", dose: "400mg", frequency: "BD" },
    ],
  },
];

const DoctorRxFavorites = () => {
  const [expandedId, setExpandedId] = useState<string | null>("1");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFavorites = favorites.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = (name: string) => {
    toast.success(`"${name}" applied to current prescription`, {
      description: "All medicines added. Review doses and modify as needed.",
    });
  };

  const handleEdit = (name: string) => {
    toast.info(`Editing "${name}"`, {
      description: "Modify medicines, doses, and frequencies.",
    });
  };

  const handleDuplicate = (name: string) => {
    toast.success(`"${name}" duplicated`, {
      description: "A copy has been created. Rename it to differentiate.",
    });
  };

  const handleDelete = (name: string) => {
    toast.error(`"${name}" deleted`, {
      description: "Favorite has been removed from your list.",
    });
  };

  const handleCreateNew = () => {
    toast.info("Create New Favorite", {
      description: "Save your current prescription as a reusable favorite.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            My Prescription Favorites
          </h1>
          <p className="text-muted-foreground mt-1">
            Saved Rx combinations for quick application — your most-used protocols
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Favorite
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search favorites by name or condition..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Favorites Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Name</th>
                  <th className="text-center p-3 text-xs font-medium text-muted-foreground">Medicines</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Condition</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Last Used</th>
                  <th className="text-center p-3 text-xs font-medium text-muted-foreground">Times Used</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFavorites.map((fav) => (
                  <>
                    <tr
                      key={fav.id}
                      className="border-b hover:bg-muted/30 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === fav.id ? null : fav.id)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {expandedId === fav.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium text-sm flex items-center gap-1">
                              <Star className="h-3 w-3 text-amber-500" />
                              {fav.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary">{fav.medicinesCount}</Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{fav.condition}</td>
                      <td className="p-3 text-sm text-muted-foreground">{fav.lastUsed}</td>
                      <td className="p-3 text-center">
                        <Badge variant="outline">{fav.timesUsed}x</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(fav.name);
                            }}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(fav.name);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(fav.name);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === fav.id && (
                      <tr key={`${fav.id}-expanded`} className="bg-blue-50/50">
                        <td colSpan={6} className="p-4">
                          <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground">
                              Medicines in "{fav.name}":
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {fav.medicines.map((med, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-sm bg-white rounded-md p-2 border"
                                >
                                  <Pill className="h-3 w-3 text-primary" />
                                  <span className="font-medium">{med.name}</span>
                                  <span className="text-muted-foreground">
                                    — {med.dose} {med.frequency}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" onClick={() => handleApply(fav.name)}>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Apply to Patient
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(fav.name)}>
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDuplicate(fav.name)}>
                                <Copy className="h-3 w-3 mr-1" />
                                Duplicate
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestion */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="py-4 flex items-center gap-3">
          <Brain className="h-5 w-5 text-purple-600" />
          <p className="text-sm text-purple-800">
            <strong>AI suggests creating a favorite</strong> based on your last 5 similar prescriptions.
            You prescribed a similar Sciatica combo 5 times this week — save it as a favorite?
          </p>
          <Button size="sm" variant="outline" className="ml-auto whitespace-nowrap">
            <Sparkles className="h-3 w-3 mr-1" />
            Create from AI
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorRxFavorites;

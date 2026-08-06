import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Clock, Sun, Moon, Leaf, CloudRain, Snowflake, Flame,
  Wind, Droplets, Calendar, Users,
} from "lucide-react";

// Reference: Charaka Samhita - Sutra Sthana Ch.6 | Ashtanga Hridaya - Sutra Sthana Ch.3

type RituType = "Shishira" | "Vasanta" | "Grishma" | "Varsha" | "Sharad" | "Hemanta";

interface RituInfo {
  name: RituType;
  english: string;
  months: string;
  icon: typeof Sun;
  color: string;
  dominantDosha: string;
  strength: string;
  agni: string;
  diet: string[];
  lifestyle: string[];
  avoid: string[];
}

interface DinacharyaStep {
  time: string;
  activity: string;
  details: string;
  icon: typeof Sun;
  doshaNote?: string;
}

const rituData: RituInfo[] = [
  {
    name: "Shishira", english: "Late Winter", months: "Mid-Jan to Mid-Mar", icon: Snowflake, color: "text-cyan-600",
    dominantDosha: "Kapha accumulation begins", strength: "Peak (Uttarayana start)", agni: "Strong (Tikshna)",
    diet: ["Heavy, unctuous foods", "Sweet, sour, salt tastes", "Wheat, new rice, jaggery", "Milk, ghee, sesame oil", "Warm water, meat soups"],
    lifestyle: ["Oil massage (Abhyanga)", "Exercise (Vyayama)", "Warm clothing", "Sun bathing", "Ubtan (herbal paste)"],
    avoid: ["Light/dry foods", "Cold drinks", "Excessive fasting", "Exposure to cold wind"],
  },
  {
    name: "Vasanta", english: "Spring", months: "Mid-Mar to Mid-May", icon: Leaf, color: "text-green-600",
    dominantDosha: "Kapha aggravation (liquefied by sun)", strength: "Medium", agni: "Weakened (Manda)",
    diet: ["Light, dry, easy-to-digest", "Barley, honey, old rice", "Bitter & astringent vegetables", "Ginger, pepper water", "Mung dal, light soups"],
    lifestyle: ["Dry powder massage (Udvartana)", "Exercise", "Nasya", "Vamana (therapeutic emesis)", "Early rising"],
    avoid: ["Heavy, oily, sweet foods", "Day sleep", "Cold items", "Sour, new grains"],
  },
  {
    name: "Grishma", english: "Summer", months: "Mid-May to Mid-Jul", icon: Flame, color: "text-red-600",
    dominantDosha: "Vata accumulation", strength: "Weak (Daurbalya)", agni: "Mild",
    diet: ["Sweet, cold, liquid foods", "Sattu drink, mantha", "Rice, milk, ghee", "Sugarcane, mango, coconut water", "Panaka (sweet drinks)"],
    lifestyle: ["Stay in cool places", "Chandana (sandalwood) application", "Light clothing", "Moon bathing", "Gardens, water bodies"],
    avoid: ["Excess exercise", "Pungent, sour, salty food", "Alcohol", "Sun exposure", "Sexual activity"],
  },
  {
    name: "Varsha", english: "Monsoon", months: "Mid-Jul to Mid-Sep", icon: CloudRain, color: "text-blue-600",
    dominantDosha: "Vata aggravation", strength: "Weak", agni: "Very weak (Manda)",
    diet: ["Old grains, warm food", "Sour & salty tastes", "Medicated water", "Honey in food", "Light soups with ghee"],
    lifestyle: ["Basti therapy", "Fumigation of house", "Boiled/filtered water only", "Light Abhyanga", "Avoid river water"],
    avoid: ["Heavy foods", "Raw salads", "Day sleep", "Excessive liquids", "Getting wet in rain"],
  },
  {
    name: "Sharad", english: "Autumn", months: "Mid-Sep to Mid-Nov", icon: Wind, color: "text-amber-600",
    dominantDosha: "Pitta aggravation", strength: "Medium (recovering)", agni: "Medium",
    diet: ["Sweet, bitter, astringent", "Shali rice, wheat, ghee", "Sugar, amla, patola", "Cool water (Hamsodaka)", "Milk with sugar"],
    lifestyle: ["Virechana (purgation)", "Blood-letting", "Moonlight exposure", "Chandana, camphor", "Wear pearls/flowers"],
    avoid: ["Hot, spicy, sour foods", "Curd, oil, fat", "Sun exposure", "Alcohol", "Day sleep"],
  },
  {
    name: "Hemanta", english: "Early Winter", months: "Mid-Nov to Mid-Jan", icon: Snowflake, color: "text-slate-600",
    dominantDosha: "Pitta pacification, Kapha accumulation starts", strength: "Peak (highest)", agni: "Strong (Tikshna)",
    diet: ["Heavy, unctuous, nourishing", "Sweet & sour tastes", "New rice, wheat, milk, sugarcane", "Sesame, jaggery, warm food", "Meat soups, wines (traditional)"],
    lifestyle: ["Oil massage (Abhyanga)", "Exercise, wrestling", "Warm clothing, blankets", "Sun exposure", "Sexual activity permissible"],
    avoid: ["Light, cold, dry foods", "Fasting", "Cold drinks/wind exposure", "Vata-aggravating routines"],
  },
];

const dinacharyaSteps: DinacharyaStep[] = [
  { time: "04:30 - 05:30", activity: "Brahma Muhurta (Wake up)", details: "Wake before sunrise. Meditate, pray, set intentions for the day.", icon: Moon, doshaNote: "Best for all Prakritis" },
  { time: "05:30 - 06:00", activity: "Ushapana & Elimination", details: "Drink warm water. Natural elimination (Mala Tyaga). Dantadhavana (brushing with neem/babool).", icon: Droplets },
  { time: "06:00 - 06:30", activity: "Jihva Nirlekhana & Gandusha", details: "Tongue scraping. Oil pulling with sesame/coconut oil (5-10 min).", icon: Droplets },
  { time: "06:30 - 07:00", activity: "Abhyanga (Oil Massage)", details: "Self-massage with warm oil. Vata: Sesame, Pitta: Coconut, Kapha: Mustard.", icon: Sun, doshaNote: "Oil varies by Prakriti" },
  { time: "07:00 - 07:30", activity: "Vyayama (Exercise)", details: "Exercise to half capacity (Ardhashakti). Yoga, walking, or bodyweight exercises.", icon: Sun },
  { time: "07:30 - 08:00", activity: "Snana (Bath)", details: "Warm/lukewarm water bath. Never hot water on head. Apply ubtan if needed.", icon: Droplets },
  { time: "08:00 - 08:30", activity: "Pratar Bhojana (Breakfast)", details: "Light, warm breakfast appropriate to season and dosha.", icon: Sun },
  { time: "08:30 - 12:00", activity: "Karma Kala (Work Period)", details: "Productive work aligned with dharma. Avoid mental stress.", icon: Sun },
  { time: "12:00 - 13:00", activity: "Madhyahna Bhojana (Lunch)", details: "Main meal of the day. Eat to 3/4 capacity. Include all 6 rasas.", icon: Sun, doshaNote: "Agni is strongest at noon" },
  { time: "13:00 - 14:00", activity: "Vama Kukshi (Short rest)", details: "Walk 100 steps. Lie on left side briefly (not full sleep in most seasons).", icon: Clock },
  { time: "14:00 - 17:00", activity: "Aparahna Karma (Afternoon)", details: "Continue productive activities. Light snack if needed (seasonal fruits).", icon: Sun },
  { time: "17:00 - 18:00", activity: "Sandhya Kala (Evening prayer)", details: "Sandhya Vandana. Light meditation or pranayama. Avoid heavy activities.", icon: Moon },
  { time: "18:30 - 19:30", activity: "Sayam Bhojana (Dinner)", details: "Light dinner. At least 2-3 hrs before sleep. Warm, easily digestible.", icon: Moon, doshaNote: "Lighter than lunch" },
  { time: "19:30 - 21:00", activity: "Leisure & Wind down", details: "Light walk. Reading. Family time. Avoid screens. Milk with nutmeg.", icon: Moon },
  { time: "21:00 - 22:00", activity: "Nidra (Sleep)", details: "Sleep on right side (Dakshina Swapna). Room dark & cool. Before 22:00.", icon: Moon, doshaNote: "Kapha time starts 22:00" },
];

function getCurrentRitu(): RituType {
  const month = new Date().getMonth(); // 0-11
  if (month >= 0 && month < 2) return "Shishira";
  if (month >= 2 && month < 4) return "Vasanta";
  if (month >= 4 && month < 6) return "Grishma";
  if (month >= 6 && month < 8) return "Varsha";
  if (month >= 8 && month < 10) return "Sharad";
  return "Hemanta";
}

const RitucharyaDinacharya = () => {
  const [currentRitu] = useState<RituType>(getCurrentRitu());
  const [selectedRitu, setSelectedRitu] = useState<RituType>(currentRitu);
  const ritu = rituData.find((r) => r.name === selectedRitu)!;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-amber-700 flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Ritucharya & Dinacharya
        </h2>
        <Badge className="bg-amber-100 text-amber-700 border-amber-300">
          Current: {currentRitu} ({rituData.find(r => r.name === currentRitu)?.english})
        </Badge>
      </div>
      <p className="text-[10px] text-muted-foreground italic">
        Ref: Charaka Samhita - Sutra Sthana Ch.6 | Ashtanga Hridaya - Sutra Sthana Ch.3
      </p>

      <Tabs defaultValue="ritucharya" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ritucharya">Ritucharya (Seasonal)</TabsTrigger>
          <TabsTrigger value="dinacharya">Dinacharya (Daily)</TabsTrigger>
        </TabsList>

        {/* Ritucharya */}
        <TabsContent value="ritucharya" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {rituData.map((r) => {
              const Icon = r.icon;
              return (
                <Badge
                  key={r.name}
                  variant={selectedRitu === r.name ? "default" : "outline"}
                  className={`cursor-pointer ${selectedRitu === r.name ? "" : ""}`}
                  onClick={() => setSelectedRitu(r.name)}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {r.name}
                  {r.name === currentRitu && <span className="ml-1 text-[8px]">●</span>}
                </Badge>
              );
            })}
          </div>

          <Card className="border-amber-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ritu.icon className={`h-4 w-4 ${ritu.color}`} />
                  {ritu.name} Ritu — {ritu.english}
                </CardTitle>
                <Badge variant="outline" className="text-[9px]">{ritu.months}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-blue-50 rounded">
                  <p className="font-medium text-blue-700">Dominant Dosha</p>
                  <p className="text-[10px] text-muted-foreground">{ritu.dominantDosha}</p>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <p className="font-medium text-green-700">Bala (Strength)</p>
                  <p className="text-[10px] text-muted-foreground">{ritu.strength}</p>
                </div>
                <div className="p-2 bg-orange-50 rounded">
                  <p className="font-medium text-orange-700">Agni Status</p>
                  <p className="text-[10px] text-muted-foreground">{ritu.agni}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs font-medium text-green-700 mb-1">✅ Diet Recommendations</p>
                  <ul className="space-y-1">
                    {ritu.diet.map((d, i) => (
                      <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                        <span className="text-green-500 mt-0.5">•</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-700 mb-1">🧘 Lifestyle (Vihara)</p>
                  <ul className="space-y-1">
                    {ritu.lifestyle.map((l, i) => (
                      <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                        <span className="text-blue-500 mt-0.5">•</span> {l}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-700 mb-1">❌ Avoid</p>
                  <ul className="space-y-1">
                    {ritu.avoid.map((a, i) => (
                      <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                        <span className="text-red-500 mt-0.5">•</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardContent className="p-3">
              <p className="text-xs font-medium text-purple-700 mb-1">🎯 Personalized Note (Vata-Pitta Prakriti)</p>
              <p className="text-[10px] text-muted-foreground">
                In {ritu.name} Ritu, for Vata-Pitta Prakriti patients: Focus on balancing elevated Vata with warm, unctuous foods.
                Avoid excess pungent/bitter in Shishira/Hemanta. Include Abhyanga with Dhanwantaram Taila.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dinacharya */}
        <TabsContent value="dinacharya" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Daily Routine (Dinacharya) — 24-Hour Template
              </CardTitle>
              <p className="text-[9px] text-muted-foreground">Personalized for Vata-Pitta Prakriti | {currentRitu} Season</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {dinacharyaSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isNight = step.time.startsWith("19") || step.time.startsWith("2") || step.time.startsWith("04");
                  return (
                    <div key={idx} className={`flex items-start gap-3 p-2 rounded text-xs ${isNight ? "bg-indigo-50" : "bg-amber-50"}`}>
                      <div className="min-w-[90px] text-[10px] font-mono text-muted-foreground">{step.time}</div>
                      <Icon className={`h-3 w-3 mt-0.5 ${isNight ? "text-indigo-500" : "text-amber-500"}`} />
                      <div className="flex-1">
                        <p className="font-medium">{step.activity}</p>
                        <p className="text-[10px] text-muted-foreground">{step.details}</p>
                        {step.doshaNote && (
                          <Badge variant="outline" className="text-[8px] mt-1 border-purple-200 text-purple-600">{step.doshaNote}</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.success("Template assigned to patient")}>
              <Users className="mr-1 h-3 w-3" /> Assign to Patient
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.info("Printing Dinacharya chart")}>
              <Calendar className="mr-1 h-3 w-3" /> Print Chart
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RitucharyaDinacharya;

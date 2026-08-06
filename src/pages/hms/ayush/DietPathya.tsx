import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Leaf, Apple, Clock, Calendar, ChevronRight, Plus, Users,
} from "lucide-react";

// Reference: Charaka Samhita - Sutra Sthana Ch.5 (Matrashitiya) | Ch.6 (Tasyashitiya)

type DoshaType = "Vata" | "Pitta" | "Kapha";

interface PathyaItem {
  category: string;
  pathya: string[];
  apathya: string[];
}

interface MealPlan {
  day: string;
  breakfast: string;
  lunch: string;
  snack: string;
  dinner: string;
}

const pathyaApathyaData: Record<string, PathyaItem[]> = {
  "Amavata (Rheumatoid)": [
    { category: "Grains", pathya: ["Old rice", "Barley", "Kulattha"], apathya: ["New rice", "Maida", "Wheat (excess)"] },
    { category: "Legumes", pathya: ["Mudga (Green gram)", "Kulattha (Horse gram)"], apathya: ["Rajmash", "Urad (Black gram)", "Chole"] },
    { category: "Vegetables", pathya: ["Drumstick", "Bitter gourd", "Pointed gourd"], apathya: ["Potato", "Brinjal", "Colocasia"] },
    { category: "Fruits", pathya: ["Pomegranate", "Amla", "Papaya"], apathya: ["Banana", "Jackfruit", "Custard Apple"] },
    { category: "Spices", pathya: ["Ginger", "Garlic", "Turmeric"], apathya: ["Tamarind excess", "Amchur excess"] },
    { category: "Others", pathya: ["Warm water", "Buttermilk", "Castor oil"], apathya: ["Curd", "Cold items", "Jaggery"] },
  ],
  "Prameha (Diabetes)": [
    { category: "Grains", pathya: ["Old Shali rice", "Barley", "Jowar"], apathya: ["New rice", "Maida", "White bread"] },
    { category: "Legumes", pathya: ["Green gram", "Chana dal", "Masoor"], apathya: ["Urad dal", "Rajma"] },
    { category: "Vegetables", pathya: ["Bitter gourd", "Methi", "Bottle gourd"], apathya: ["Potato", "Sweet potato", "Yam"] },
    { category: "Fruits", pathya: ["Jamun", "Amla", "Guava"], apathya: ["Mango", "Grapes", "Sapota"] },
    { category: "Spices", pathya: ["Turmeric", "Fenugreek", "Cinnamon"], apathya: ["Excess salt", "Excess sugar"] },
    { category: "Others", pathya: ["Honey (small qty)", "Triphala water"], apathya: ["Jaggery", "Sugar", "Alcohol"] },
  ],
  "Raktapitta (Bleeding disorders)": [
    { category: "Grains", pathya: ["Old rice", "Wheat", "Barley"], apathya: ["New rice", "Corn"] },
    { category: "Legumes", pathya: ["Green gram", "Masoor dal"], apathya: ["Urad dal", "Horse gram"] },
    { category: "Vegetables", pathya: ["Bottle gourd", "Ash gourd", "Tender coconut"], apathya: ["Garlic", "Onion (raw)", "Brinjal"] },
    { category: "Fruits", pathya: ["Pomegranate", "Grapes", "Amla", "Sugarcane"], apathya: ["Sour fruits", "Citrus excess"] },
    { category: "Others", pathya: ["Ghee", "Milk", "Sheetala Jala (cool water)"], apathya: ["Alcohol", "Spicy food", "Pickles"] },
  ],
};

const weeklyMealPlan: Record<DoshaType, MealPlan[]> = {
  Vata: [
    { day: "Monday", breakfast: "Warm milk + Soaked almonds + Dates", lunch: "Rice + Ghee + Moong dal + Seasonal veg", snack: "Warm soup + Dry fruit laddu", dinner: "Khichdi + Buttermilk" },
    { day: "Tuesday", breakfast: "Poha with turmeric + Warm water", lunch: "Chapati + Mixed veg + Dal + Ghee", snack: "Sweet potato chaat", dinner: "Daliya (porridge) + Warm milk" },
    { day: "Wednesday", breakfast: "Upma + Coconut chutney + Warm milk", lunch: "Rice + Rasam + Avial + Papad", snack: "Banana + Jaggery", dinner: "Vegetable soup + Soft chapati" },
    { day: "Thursday", breakfast: "Idli + Sambar + Warm water", lunch: "Rice + Ghee + Spinach dal", snack: "Warm herbal tea + Til laddu", dinner: "Khichdi + Pickle (mild)" },
    { day: "Friday", breakfast: "Dalia + Milk + Dry fruits", lunch: "Chapati + Paneer + Dal", snack: "Fruit salad (warm spices)", dinner: "Rice + Light curry + Buttermilk" },
    { day: "Saturday", breakfast: "Paratha + Curd + Jaggery", lunch: "Rice + Sambar + Kootu + Ghee", snack: "Masala chai + Roasted nuts", dinner: "Soup + Soft bread" },
    { day: "Sunday", breakfast: "Pongal + Chutney + Warm milk", lunch: "Biryani (mild) + Raita + Salad", snack: "Halwa (warm)", dinner: "Light khichdi + Warm milk" },
  ],
  Pitta: [
    { day: "Monday", breakfast: "Cooling smoothie + Soaked raisins", lunch: "Rice + Coconut dal + Ash gourd", snack: "Tender coconut water + Fruit", dinner: "Chapati + Lauki sabzi + Curd" },
    { day: "Tuesday", breakfast: "Wheat flakes + Cool milk + Dates", lunch: "Rice + Mint raita + Moong dal", snack: "Cucumber juice + Makhana", dinner: "Khichdi + Cool buttermilk" },
    { day: "Wednesday", breakfast: "Poha + Pomegranate + Milk", lunch: "Rice + Ghee + Bottle gourd + Dal", snack: "Watermelon + Rose water", dinner: "Chapati + Mix veg (cooling)" },
    { day: "Thursday", breakfast: "Idli + Coconut chutney + Fruit", lunch: "Rice + Rasam (mild) + Avial", snack: "Sugarcane juice + Dates", dinner: "Light rice + Curd + Cucumber" },
    { day: "Friday", breakfast: "Oats + Milk + Amla murabba", lunch: "Chapati + Paneer + Mild dal", snack: "Grapes + Cool herbal tea", dinner: "Soft rice + Lauki + Ghee" },
    { day: "Saturday", breakfast: "Sabudana khichdi + Curd", lunch: "Rice + Sambar (mild) + Salad", snack: "Sweet lassi + Dry fruits", dinner: "Dalia + Milk" },
    { day: "Sunday", breakfast: "Fruit platter + Milk + Honey", lunch: "Pulao (mild) + Raita + Salad", snack: "Gulkand + Cool drink", dinner: "Light khichdi + Buttermilk" },
  ],
  Kapha: [
    { day: "Monday", breakfast: "Warm water + Honey + Light upma", lunch: "Barley roti + Bitter gourd + Moong", snack: "Green tea + Roasted chana", dinner: "Soup + Millet chapati" },
    { day: "Tuesday", breakfast: "Warm lemon water + Poha (dry)", lunch: "Millet + Drumstick sambar + Salad", snack: "Ginger tea + Puffed rice", dinner: "Light soup + Ragi roti" },
    { day: "Wednesday", breakfast: "Kanji + Light toast + Honey", lunch: "Brown rice + Rasam + Drumstick", snack: "Warm spiced water + Apple", dinner: "Vegetable clear soup" },
    { day: "Thursday", breakfast: "Moong sprouts + Lemon + Warm water", lunch: "Jowar roti + Mix veg (dry) + Dal", snack: "Tulsi tea + Dry fruits (few)", dinner: "Light khichdi (less ghee)" },
    { day: "Friday", breakfast: "Ragi porridge + Honey + Warm water", lunch: "Chapati + Methi sabzi + Light dal", snack: "Warm water + Murmura", dinner: "Millet soup + Salad" },
    { day: "Saturday", breakfast: "Warm milk (skim) + Turmeric + Toast", lunch: "Barley + Bottle gourd + Moong", snack: "Jeera water + Light snack", dinner: "Soup + Steamed veggies" },
    { day: "Sunday", breakfast: "Upma (dry) + Green tea + Fruit", lunch: "Rice (small) + Rasam + Salad", snack: "Herbal tea + Roasted makhana", dinner: "Clear soup + Chapati (small)" },
  ],
};

const ritucharya = [
  { ritu: "Shishira (Late Winter)", months: "Jan-Feb", taste: "Madhura, Amla, Lavana", diet: "Heavy, unctuous, warm foods. Wheat, jaggery, milk, ghee.", avoid: "Light, cold, dry foods. Fasting." },
  { ritu: "Vasanta (Spring)", months: "Mar-Apr", taste: "Katu, Tikta, Kashaya", diet: "Barley, honey, light foods. Old rice, wheat.", avoid: "Heavy, oily, sweet, sour foods. Day sleep." },
  { ritu: "Grishma (Summer)", months: "May-Jun", taste: "Madhura, Sheeta", diet: "Sweet, cold, liquid foods. Rice, milk, ghee, mango.", avoid: "Pungent, sour, salt. Alcohol. Excess exercise." },
  { ritu: "Varsha (Monsoon)", months: "Jul-Aug", taste: "Amla, Lavana", diet: "Old grains, medicated water, light food. Honey.", avoid: "Heavy food, river water, day sleep, excess liquids." },
  { ritu: "Sharad (Autumn)", months: "Sep-Oct", taste: "Madhura, Tikta", diet: "Ghee, bitter foods, wheat, sugar. Shali rice.", avoid: "Fat, oil, curd, alkali, sun exposure." },
  { ritu: "Hemanta (Early Winter)", months: "Nov-Dec", taste: "Madhura, Amla, Lavana", diet: "Heavy, unctuous food. Milk, sugarcane, sesame, new rice.", avoid: "Light food, fasting, cold food, Vata-aggravating diet." },
];

const DietPathya = () => {
  const [selectedDosha, setSelectedDosha] = useState<DoshaType>("Vata");
  const [selectedDisease, setSelectedDisease] = useState("Amavata (Rheumatoid)");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-green-700 flex items-center gap-2">
          <Leaf className="h-5 w-5" /> Diet & Pathya-Apathya Management
        </h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-1 h-3 w-3" /> Assign Diet Plan
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground italic">
        Ref: Charaka Samhita - Sutra Sthana Ch.5 (Matrashitiya) | Ch.6 (Tasyashitiya)
      </p>

      <Tabs defaultValue="pathya" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pathya">Pathya-Apathya</TabsTrigger>
          <TabsTrigger value="meal-plan">Meal Plan</TabsTrigger>
          <TabsTrigger value="ritucharya">Ritucharya Diet</TabsTrigger>
        </TabsList>

        {/* Pathya-Apathya Tables */}
        <TabsContent value="pathya" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {Object.keys(pathyaApathyaData).map((disease) => (
              <Badge
                key={disease}
                variant={selectedDisease === disease ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedDisease(disease)}
              >
                {disease}
              </Badge>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Apple className="h-4 w-4 text-green-600" />
                {selectedDisease} — Do&apos;s &amp; Don&apos;ts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 w-24">Category</th>
                      <th className="text-left p-2 text-green-700">✅ Pathya (Do&apos;s)</th>
                      <th className="text-left p-2 text-red-700">❌ Apathya (Don&apos;ts)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pathyaApathyaData[selectedDisease]?.map((item, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="p-2 font-medium text-muted-foreground">{item.category}</td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            {item.pathya.map((p, i) => (
                              <Badge key={i} variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-200">
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            {item.apathya.map((a, i) => (
                              <Badge key={i} variant="outline" className="text-[9px] bg-red-50 text-red-700 border-red-200">
                                {a}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Meal Plan */}
        <TabsContent value="meal-plan" className="space-y-4">
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground">Dosha:</span>
            {(["Vata", "Pitta", "Kapha"] as DoshaType[]).map((d) => (
              <Badge
                key={d}
                variant={selectedDosha === d ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedDosha(d)}
              >
                {d}
              </Badge>
            ))}
            <Button size="sm" variant="outline" className="ml-auto text-xs" onClick={() => toast.success("Meal plan generated for " + selectedDosha)}>
              <Calendar className="mr-1 h-3 w-3" /> Generate Plan
            </Button>
          </div>

          <div className="grid gap-2">
            {weeklyMealPlan[selectedDosha].map((meal) => (
              <Card key={meal.day} className="border-green-100">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="text-[9px] min-w-[60px] justify-center">{meal.day}</Badge>
                    <div className="grid sm:grid-cols-4 gap-2 flex-1 text-[10px]">
                      <div><span className="text-muted-foreground">🌅 Breakfast:</span> <span>{meal.breakfast}</span></div>
                      <div><span className="text-muted-foreground">☀️ Lunch:</span> <span>{meal.lunch}</span></div>
                      <div><span className="text-muted-foreground">🍵 Snack:</span> <span>{meal.snack}</span></div>
                      <div><span className="text-muted-foreground">🌙 Dinner:</span> <span>{meal.dinner}</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Ritucharya Diet Guidance */}
        <TabsContent value="ritucharya" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ritucharya.map((r) => (
              <Card key={r.ritu} className="border-amber-100 hover:border-amber-300 transition">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-2">
                    <Clock className="h-3 w-3 text-amber-600" />
                    {r.ritu}
                  </CardTitle>
                  <p className="text-[9px] text-muted-foreground">{r.months} | Rasa: {r.taste}</p>
                </CardHeader>
                <CardContent className="space-y-2 text-[10px]">
                  <div>
                    <p className="font-medium text-green-700">✅ Recommended:</p>
                    <p className="text-muted-foreground">{r.diet}</p>
                  </div>
                  <div>
                    <p className="font-medium text-red-700">❌ Avoid:</p>
                    <p className="text-muted-foreground">{r.avoid}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DietPathya;

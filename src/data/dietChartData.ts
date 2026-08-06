/**
 * Disease-wise Weekly Diet Charts with Pathyapathya
 * Multi-language: English + Hindi (extensible to Malayalam, Tamil, Kannada)
 * Source: CCRAS Classical Prescriptions + Ayurvedic dietary principles
 */

export type Language = "en" | "hi" | "ta" | "ml" | "kn";

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी",
  ta: "தமிழ்",
  ml: "മലയാളം",
  kn: "ಕನ್ನಡ",
};

export type MealPlan = {
  breakfast: string;
  midMorning: string;
  lunch: string;
  evening: string;
  dinner: string;
};

export type DietChart = {
  id: string;
  diseaseKey: string;
  diseaseName: Partial<Record<Language, string>>;
  pathya: Partial<Record<Language, string[]>>;
  apathya: Partial<Record<Language, string[]>>;
  lifestylePathya: Partial<Record<Language, string[]>>;
  lifestyleApathya: Partial<Record<Language, string[]>>;
  weeklyPlan: Partial<Record<Language, MealPlan[]>>; // 7 days
  notes: Partial<Record<Language, string>>;
};

export const DIET_CHARTS: DietChart[] = [
// ══════════ 1. JVARA (FEVER) ══════════
{
  id: "jvara",
  diseaseKey: "jvara",
  diseaseName: { en: "Jvara (Fever)", hi: "ज्वर (बुखार)", ta: "ஜ்வரம் (காய்ச்சல்)", ml: "ജ്വരം (പനി)", kn: "ಜ್ವರ (ಜ್ವರ)" },
  pathya: {
    en: ["Old rice / gruel (yavagu)", "Barley porridge (daliya)", "Green gram (mudga) soup", "Pomegranate", "Light digestible food", "Warm water"],
    hi: ["पुराने चावल / यवागू", "जौ का दलिया", "मूंग दाल का सूप", "अनार", "हल्का सुपाच्य भोजन", "गर्म पानी"],
    ta: ["பழைய அரிசி / கஞ்சி", "பார்லி கஞ்சி", "பாசிப்பயறு சூப்", "மாதுளை", "எளிதில் ஜீரணமாகும் உணவு", "வெந்நீர்"],
    ml: ["പഴയ അരി / കഞ്ഞി", "ബാർലി കഞ്ഞി", "ചെറുപയർ സൂപ്പ്", "മാതളനാരങ്ങ", "ലഘുവായ ആഹാരം", "ചൂടുവെള്ളം"],
    kn: ["ಹಳೆಯ ಅಕ್ಕಿ / ಗಂಜಿ", "ಬಾರ್ಲಿ ಗಂಜಿ", "ಹೆಸರು ಬೇಳೆ ಸೂಪ್", "ದಾಳಿಂಬೆ", "ಹಗುರ ಜೀರ್ಣವಾಗುವ ಆಹಾರ", "ಬಿಸಿನೀರು"],
  },
  apathya: {
    en: ["Heavy food", "Fried / junk food", "Sesame", "Cold water", "Stale food", "Contaminated water"],
    hi: ["भारी भोजन", "तला / जंक फूड", "तिल", "ठंडा पानी", "बासी भोजन", "दूषित पानी"],
    ta: ["கனமான உணவு", "பொரித்த / குப்பை உணவு", "எள்", "குளிர்ந்த நீர்", "பழைய உணவு", "மாசுபட்ட நீர்"],
    ml: ["കനത്ത ഭക്ഷണം", "വറുത്ത / ജങ്ക് ഫുഡ്", "എള്ള്", "തണുത്ത വെള്ളം", "പഴകിയ ഭക്ഷണം", "മലിനജലം"],
    kn: ["ಭಾರವಾದ ಆಹಾರ", "ಕರಿದ / ಜಂಕ್ ಫುಡ್", "ಎಳ್ಳು", "ತಣ್ಣೀರು", "ಹಳಸಿದ ಆಹಾರ", "ಕಲುಷಿತ ನೀರು"],
  },
  lifestylePathya: {
    en: ["Fasting (langhana)", "Rest", "Light massage"],
    hi: ["लंघन (उपवास)", "आराम", "हल्की मालिश"],
  },
  lifestyleApathya: {
    en: ["Physical exercise", "Day sleeping", "Bathing (in acute phase)", "Suppression of natural urges"],
    hi: ["शारीरिक व्यायाम", "दिन में सोना", "स्नान (तीव्र अवस्था में)", "वेग धारण"],
  },
  weeklyPlan: {
    en: [
      { breakfast: "Rice gruel (kanji) with rock salt", midMorning: "Pomegranate juice", lunch: "Old rice + mudga dal + patola sabji", evening: "Warm water with honey", dinner: "Barley porridge (daliya) light" },
      { breakfast: "Barley water with ginger", midMorning: "Mosambi juice (lukewarm)", lunch: "Khichdi (rice + mudga dal)", evening: "Tulsi + ginger tea", dinner: "Vegetable soup (light)" },
      { breakfast: "Toast with warm water", midMorning: "Coconut water", lunch: "Rice gruel + boiled vegetables", evening: "Warm lemon water", dinner: "Mudga dal soup + soft rice" },
      { breakfast: "Daliya (barley porridge)", midMorning: "Pomegranate", lunch: "Plain rice + lauki (bottle gourd) sabji", evening: "Warm water + honey", dinner: "Light khichdi" },
      { breakfast: "Rice flakes (poha) light", midMorning: "Warm milk with turmeric", lunch: "Rice + mudga dal + patola", evening: "Ginger + tulsi kashaya", dinner: "Vegetable soup" },
      { breakfast: "Barley gruel", midMorning: "Fresh fruit juice (warm)", lunch: "Khichdi + curd (if appetite returned)", evening: "Warm water", dinner: "Soft chapati + dal" },
      { breakfast: "Daliya with ghee (small qty)", midMorning: "Pomegranate juice", lunch: "Rice + seasonal vegetables + dal", evening: "Light snack", dinner: "Khichdi with ghee" },
    ],
    hi: [
      { breakfast: "चावल का कांजी (नमक के साथ)", midMorning: "अनार का रस", lunch: "पुराने चावल + मूंग दाल + परवल सब्जी", evening: "गर्म पानी + शहद", dinner: "हल्का जौ का दलिया" },
      { breakfast: "जौ का पानी + अदरक", midMorning: "मौसमी रस (गुनगुना)", lunch: "खिचड़ी (चावल + मूंग)", evening: "तुलसी + अदरक चाय", dinner: "सब्जी का सूप (हल्का)" },
      { breakfast: "टोस्ट + गर्म पानी", midMorning: "नारियल पानी", lunch: "कांजी + उबली सब्जियाँ", evening: "गर्म नींबू पानी", dinner: "मूंग दाल सूप + मुलायम चावल" },
      { breakfast: "दलिया (जौ)", midMorning: "अनार", lunch: "सादे चावल + लौकी सब्जी", evening: "गर्म पानी + शहद", dinner: "हल्की खिचड़ी" },
      { breakfast: "पोहा (हल्का)", midMorning: "हल्दी दूध (गर्म)", lunch: "चावल + मूंग दाल + परवल", evening: "अदरक + तुलसी काढ़ा", dinner: "सब्जी का सूप" },
      { breakfast: "जौ का कांजी", midMorning: "ताज़ा फल रस (गर्म)", lunch: "खिचड़ी + दही (भूख लौटने पर)", evening: "गर्म पानी", dinner: "नरम रोटी + दाल" },
      { breakfast: "दलिया + घी (थोड़ा)", midMorning: "अनार का रस", lunch: "चावल + मौसमी सब्जी + दाल", evening: "हल्का नाश्ता", dinner: "खिचड़ी + घी" },
    ],
  },
  notes: {
    en: "Adult dose. For children use half portions. Adjust diet as per tolerance. Stop if any discomfort.",
    hi: "वयस्क मात्रा। बच्चों के लिए आधी मात्रा। सहनशीलता अनुसार आहार समायोजित करें। किसी भी असुविधा पर रोकें।",
  },
},
// ══════════ 2. AMAVATA (RHEUMATISM) ══════════
{
  id: "amavata",
  diseaseKey: "amavata",
  diseaseName: { en: "Amavata (Rheumatism)", hi: "आमवात (गठिया)" },
  pathya: {
    en: ["Barley", "Red rice", "Kulattha dal", "Drumstick (sigru)", "Bitter gourd", "Dry ginger", "Garlic", "Cumin", "Buttermilk", "Luke warm water", "Castor oil"],
    hi: ["जौ", "लाल चावल", "कुल्थी दाल", "सहजन (शिग्रु)", "करेला", "सोंठ", "लहसुन", "जीरा", "छाछ", "गुनगुना पानी", "अरंडी तेल"],
  },
  apathya: {
    en: ["Curd", "Fish", "Jaggery", "Milk", "Incompatible food", "Heavy food", "Black gram (udada)"],
    hi: ["दही", "मछली", "गुड़", "दूध", "विरुद्ध आहार", "भारी भोजन", "उड़द दाल"],
  },
  lifestylePathya: {
    en: ["Sudation (swedana)", "Light exercise", "Walking", "Woolen clothes", "Fasting"],
    hi: ["स्वेदन", "हल्का व्यायाम", "चलना", "ऊनी कपड़े", "उपवास"],
  },
  lifestyleApathya: {
    en: ["Suppression of natural urges", "Night awakening", "Tension / worry", "Cloudy weather exposure"],
    hi: ["वेग धारण", "रात्रि जागरण", "चिंता / तनाव", "बादल मौसम में बाहर रहना"],
  },
  weeklyPlan: {
    en: [
      { breakfast: "Barley porridge + dry ginger powder", midMorning: "Warm water with honey", lunch: "Red rice + kulattha dal + drumstick sabji", evening: "Ginger + ajwain tea", dinner: "Light chapati + bottle gourd soup" },
      { breakfast: "Ragi porridge (warm)", midMorning: "Buttermilk with cumin + rock salt", lunch: "Barley roti + bitter gourd sabji + dal", evening: "Warm water + shunthi", dinner: "Vegetable soup + soft rice" },
      { breakfast: "Poha with turmeric + ginger", midMorning: "Warm lemon water", lunch: "Rice + paravala sabji + kulattha dal", evening: "Ajwain water (warm)", dinner: "Khichdi with castor oil (2ml)" },
      { breakfast: "Daliya (warm) + black pepper", midMorning: "Garlic + honey (1 clove)", lunch: "Chapati + drumstick sabji + dal", evening: "Warm herbal tea", dinner: "Light mudga soup + rice" },
      { breakfast: "Barley flakes + warm water", midMorning: "Buttermilk", lunch: "Red rice + karela sabji + kulattha", evening: "Ginger kashaya", dinner: "Soft roti + lauki sabji" },
      { breakfast: "Warm ragi kanji", midMorning: "Warm water + lemon", lunch: "Barley roti + paravala + dal", evening: "Ajwain + saunf tea", dinner: "Light soup + chapati" },
      { breakfast: "Daliya + ghee (little)", midMorning: "Warm buttermilk", lunch: "Rice + seasonal sabji + kulattha dal", evening: "Warm water", dinner: "Khichdi + ginger" },
    ],
    hi: [
      { breakfast: "जौ का दलिया + सोंठ पाउडर", midMorning: "गर्म पानी + शहद", lunch: "लाल चावल + कुल्थी दाल + सहजन सब्जी", evening: "अदरक + अजवाइन चाय", dinner: "हल्की रोटी + लौकी सूप" },
      { breakfast: "रागी दलिया (गर्म)", midMorning: "छाछ + जीरा + सेंधा नमक", lunch: "जौ रोटी + करेला सब्जी + दाल", evening: "गर्म पानी + सोंठ", dinner: "सब्जी सूप + मुलायम चावल" },
      { breakfast: "पोहा + हल्दी + अदरक", midMorning: "गर्म नींबू पानी", lunch: "चावल + परवल सब्जी + कुल्थी दाल", evening: "अजवाइन पानी (गर्म)", dinner: "खिचड़ी + अरंडी तेल (2ml)" },
      { breakfast: "दलिया (गर्म) + काली मिर्च", midMorning: "लहसुन + शहद (1 कली)", lunch: "रोटी + सहजन सब्जी + दाल", evening: "गर्म हर्बल चाय", dinner: "हल्का मूंग सूप + चावल" },
      { breakfast: "जौ फ्लेक्स + गर्म पानी", midMorning: "छाछ", lunch: "लाल चावल + करेला सब्जी + कुल्थी", evening: "अदरक काढ़ा", dinner: "नरम रोटी + लौकी सब्जी" },
      { breakfast: "गर्म रागी कांजी", midMorning: "गर्म पानी + नींबू", lunch: "जौ रोटी + परवल + दाल", evening: "अजवाइन + सौंफ चाय", dinner: "हल्का सूप + रोटी" },
      { breakfast: "दलिया + घी (थोड़ा)", midMorning: "गर्म छाछ", lunch: "चावल + मौसमी सब्जी + कुल्थी दाल", evening: "गर्म पानी", dinner: "खिचड़ी + अदरक" },
    ],
  },
  notes: {
    en: "Avoid cold exposure. Keep joints warm. Castor oil (5-10ml) at bedtime with warm milk helps. Walking 20 min daily recommended.",
    hi: "ठंड से बचें। जोड़ों को गर्म रखें। सोते समय अरंडी तेल (5-10ml) गर्म दूध से लें। रोज 20 मिनट चलना लाभदायक।",
  },
},
// ══════════ 3. MADHUMEHA (DIABETES) ══════════
{
  id: "madhumeha",
  diseaseKey: "madhumeha",
  diseaseName: { en: "Madhumeha (Diabetes Mellitus)", hi: "मधुमेह (डायबिटीज़)" },
  pathya: {
    en: ["Barley", "Wheat", "Bitter gourd", "Amalaki", "Haridra", "Green gram", "Honey", "Kulattha", "Patola", "Black pepper"],
    hi: ["जौ", "गेहूँ", "करेला", "आँवला", "हल्दी", "मूंग", "शहद", "कुल्थी", "परवल", "काली मिर्च"],
  },
  apathya: {
    en: ["Rice", "Milk", "Curd", "Butter", "Oil", "Jaggery", "Sugar", "Alcohol", "Sweet fruits", "Black gram"],
    hi: ["चावल", "दूध", "दही", "मक्खन", "तेल", "गुड़", "चीनी", "शराब", "मीठे फल", "उड़द दाल"],
  },
  lifestylePathya: {
    en: ["Walking", "Physical exercise", "Bathing", "Playing / sports"],
    hi: ["चलना", "शारीरिक व्यायाम", "स्नान", "खेलना / खेलकूद"],
  },
  lifestyleApathya: {
    en: ["Day sleeping", "Sudation", "Smoking", "Suppression of natural urges"],
    hi: ["दिन में सोना", "स्वेदन", "धूम्रपान", "वेग धारण"],
  },
  weeklyPlan: {
    en: [
      { breakfast: "Barley porridge + methi seeds", midMorning: "Bitter gourd juice (20ml)", lunch: "Wheat chapati + karela sabji + mudga dal", evening: "Green tea + walnuts", dinner: "Bajra roti + lauki sabji" },
      { breakfast: "Moong dal chilla + green chutney", midMorning: "Amla juice (20ml)", lunch: "Barley roti + palak + kulattha dal", evening: "Roasted chana", dinner: "Mixed veg soup + wheat roti" },
      { breakfast: "Oats + cinnamon + almonds", midMorning: "Buttermilk with methi", lunch: "Brown rice (small) + karela + dal", evening: "Cucumber + tomato salad", dinner: "Khichdi (barley + mudga)" },
      { breakfast: "Ragi dosa + sambar", midMorning: "Warm water + turmeric", lunch: "Wheat chapati + patola sabji + dal", evening: "Green tea", dinner: "Soup + barley roti" },
      { breakfast: "Besan chilla + pudina chutney", midMorning: "Jamun (seasonal)", lunch: "Chapati + drumstick sabji + mudga", evening: "Roasted flax seeds", dinner: "Light dal + roti" },
      { breakfast: "Daliya + vegetables", midMorning: "Karela juice (15ml)", lunch: "Roti + mixed veg + kulattha dal", evening: "Warm water + lemon", dinner: "Palak soup + roti" },
      { breakfast: "Idli (ragi) + sambar", midMorning: "Amla + turmeric water", lunch: "Barley roti + seasonal sabji + dal", evening: "Sprouts salad", dinner: "Light khichdi" },
    ],
    hi: [
      { breakfast: "जौ दलिया + मेथी दाना", midMorning: "करेला रस (20ml)", lunch: "गेहूँ रोटी + करेला सब्जी + मूंग दाल", evening: "ग्रीन टी + अखरोट", dinner: "बाजरा रोटी + लौकी सब्जी" },
      { breakfast: "मूंग दाल चीला + हरी चटनी", midMorning: "आँवला रस (20ml)", lunch: "जौ रोटी + पालक + कुल्थी दाल", evening: "भुना चना", dinner: "मिक्स वेज सूप + गेहूँ रोटी" },
      { breakfast: "ओट्स + दालचीनी + बादाम", midMorning: "छाछ + मेथी", lunch: "ब्राउन राइस (कम) + करेला + दाल", evening: "खीरा + टमाटर सलाद", dinner: "खिचड़ी (जौ + मूंग)" },
      { breakfast: "रागी डोसा + सांबर", midMorning: "गर्म पानी + हल्दी", lunch: "गेहूँ रोटी + परवल सब्जी + दाल", evening: "ग्रीन टी", dinner: "सूप + जौ रोटी" },
      { breakfast: "बेसन चीला + पुदीना चटनी", midMorning: "जामुन (मौसमी)", lunch: "रोटी + सहजन सब्जी + मूंग", evening: "भुने अलसी बीज", dinner: "हल्की दाल + रोटी" },
      { breakfast: "दलिया + सब्जियाँ", midMorning: "करेला रस (15ml)", lunch: "रोटी + मिक्स वेज + कुल्थी दाल", evening: "गर्म पानी + नींबू", dinner: "पालक सूप + रोटी" },
      { breakfast: "इडली (रागी) + सांबर", midMorning: "आँवला + हल्दी पानी", lunch: "जौ रोटी + मौसमी सब्जी + दाल", evening: "अंकुरित सलाद", dinner: "हल्की खिचड़ी" },
    ],
  },
  notes: {
    en: "Walk 30 minutes daily. Avoid sugary foods completely. Bitter gourd and methi are excellent. Monitor blood sugar regularly.",
    hi: "रोज 30 मिनट चलें। मीठा पूरी तरह बंद करें। करेला और मेथी उत्तम हैं। नियमित रक्त शर्करा जाँच करें।",
  },
},
// ══════════ 4. AMLAPITTA (ACIDITY) ══════════
{
  id: "amlapitta",
  diseaseKey: "amlapitta",
  diseaseName: { en: "Amlapitta (Acid Peptic Disorder)", hi: "अम्लपित्त (एसिडिटी)" },
  pathya: {
    en: ["Barley", "Green gram", "Patola", "Bitter gourd", "White gourd melon", "Green vegetables", "Cold water"],
    hi: ["जौ", "मूंग", "परवल", "करेला", "पेठा", "हरी सब्जियाँ", "ठंडा पानी"],
  },
  apathya: {
    en: ["Rice", "Chickpea flour", "Black gram", "Kulattha", "Potato", "Brinjal", "Sour food", "Tea", "Coffee", "Spicy food", "Alcohol", "Fast food"],
    hi: ["चावल", "बेसन", "उड़द", "कुल्थी", "आलू", "बैंगन", "खट्टा भोजन", "चाय", "कॉफी", "मसालेदार भोजन", "शराब", "फास्ट फूड"],
  },
  lifestylePathya: {
    en: ["Vamana (therapeutic emesis)", "Virecana", "Vasti"],
    hi: ["वमन", "विरेचन", "वस्ति"],
  },
  lifestyleApathya: {
    en: ["Day sleeping", "Suppression of natural urges", "Stress"],
    hi: ["दिन में सोना", "वेग धारण", "तनाव"],
  },
  weeklyPlan: {
    en: [
      { breakfast: "Sattu drink (barley) + cold water", midMorning: "Coconut water", lunch: "Chapati + lauki sabji + mudga dal", evening: "Banana + cold milk", dinner: "Khichdi (light)" },
      { breakfast: "Poha (without spice) + coriander", midMorning: "Amla candy", lunch: "Rice + patola sabji + dal", evening: "Cold milk", dinner: "Soft chapati + pumpkin sabji" },
      { breakfast: "Ragi porridge + banana", midMorning: "Coconut water", lunch: "Barley roti + bitter gourd + dal", evening: "Gulkand + milk", dinner: "Vegetable soup" },
      { breakfast: "Oats + milk (cold)", midMorning: "Sweet lime juice", lunch: "Chapati + petha sabji + mudga dal", evening: "Banana", dinner: "Light khichdi + ghee" },
      { breakfast: "Daliya + ghee", midMorning: "Cold water + mishri", lunch: "Rice + lauki + dal", evening: "Coconut water", dinner: "Soft roti + pumpkin" },
      { breakfast: "Idli + coriander chutney", midMorning: "Pomegranate", lunch: "Chapati + patola + dal", evening: "Cold milk + mishri", dinner: "Soup + soft rice" },
      { breakfast: "Sattu + banana", midMorning: "Amla juice (diluted)", lunch: "Barley roti + green veg + dal", evening: "Coconut water", dinner: "Khichdi + curd (sweet)" },
    ],
    hi: [
      { breakfast: "सत्तू पेय (जौ) + ठंडा पानी", midMorning: "नारियल पानी", lunch: "रोटी + लौकी सब्जी + मूंग दाल", evening: "केला + ठंडा दूध", dinner: "हल्की खिचड़ी" },
      { breakfast: "पोहा (बिना मसाला) + धनिया", midMorning: "आँवला कैंडी", lunch: "चावल + परवल सब्जी + दाल", evening: "ठंडा दूध", dinner: "नरम रोटी + कद्दू सब्जी" },
      { breakfast: "रागी दलिया + केला", midMorning: "नारियल पानी", lunch: "जौ रोटी + करेला + दाल", evening: "गुलकंद + दूध", dinner: "सब्जी सूप" },
      { breakfast: "ओट्स + दूध (ठंडा)", midMorning: "मौसमी रस", lunch: "रोटी + पेठा सब्जी + मूंग दाल", evening: "केला", dinner: "हल्की खिचड़ी + घी" },
      { breakfast: "दलिया + घी", midMorning: "ठंडा पानी + मिश्री", lunch: "चावल + लौकी + दाल", evening: "नारियल पानी", dinner: "नरम रोटी + कद्दू" },
      { breakfast: "इडली + धनिया चटनी", midMorning: "अनार", lunch: "रोटी + परवल + दाल", evening: "ठंडा दूध + मिश्री", dinner: "सूप + मुलायम चावल" },
      { breakfast: "सत्तू + केला", midMorning: "आँवला रस (पतला)", lunch: "जौ रोटी + हरी सब्जी + दाल", evening: "नारियल पानी", dinner: "खिचड़ी + दही (मीठी)" },
    ],
  },
  notes: {
    en: "Avoid empty stomach. Eat on time. No spicy, sour, or fried food. Coconut water and cold milk are excellent antacids.",
    hi: "खाली पेट न रहें। समय पर खाएँ। मसालेदार, खट्टा, तला भोजन न करें। नारियल पानी और ठंडा दूध उत्तम एंटासिड हैं।",
  },
},
// ══════════ 5. KASA (COUGH) ══════════
{
  id: "kasa",
  diseaseKey: "kasa",
  diseaseName: { en: "Kasa (Cough)", hi: "कास (खाँसी)" },
  pathya: {
    en: ["Old rice", "Wheat", "Barley", "Green gram soup", "Cow's milk", "Goat's milk", "Clarified butter", "Honey", "Garlic", "Black pepper", "Dry ginger", "Long pepper", "Luke warm water"],
    hi: ["पुराने चावल", "गेहूँ", "जौ", "मूंग सूप", "गाय का दूध", "बकरी का दूध", "घी", "शहद", "लहसुन", "काली मिर्च", "सोंठ", "पिप्पली", "गुनगुना पानी"],
  },
  apathya: {
    en: ["Dust / smoke", "Fish", "Cold food", "Cold water", "Dry food", "Potato", "Mustard leaf"],
    hi: ["धूल / धुआँ", "मछली", "ठंडा भोजन", "ठंडा पानी", "सूखा भोजन", "आलू", "सरसों का साग"],
  },
  lifestylePathya: {
    en: ["Sudation", "Virecana", "Smoking (herbal dhoomapana)", "Massage"],
    hi: ["स्वेदन", "विरेचन", "धूमपान (हर्बल)", "मालिश"],
  },
  lifestyleApathya: {
    en: ["Vasti", "Snuffing", "Blood letting", "Exercise", "Suppression of urges"],
    hi: ["वस्ति", "नस्य", "रक्तमोक्षण", "व्यायाम", "वेग धारण"],
  },
  weeklyPlan: {
    en: [
      { breakfast: "Warm milk + turmeric + black pepper", midMorning: "Honey + ginger juice (5ml)", lunch: "Wheat chapati + mudga dal + patola", evening: "Tulsi + ginger + honey tea", dinner: "Khichdi + ghee" },
      { breakfast: "Daliya (warm) + ghee", midMorning: "Warm water + honey", lunch: "Rice + palak + dal", evening: "Pippali + honey", dinner: "Soup + soft roti" },
      { breakfast: "Warm porridge + cardamom", midMorning: "Vasa swarasa + honey (5ml)", lunch: "Chapati + lauki + mudga dal", evening: "Warm milk + turmeric", dinner: "Light khichdi" },
      { breakfast: "Ragi malt (warm)", midMorning: "Sitopaladi churna + honey", lunch: "Rice + drumstick sabji + dal", evening: "Ginger tea", dinner: "Vegetable soup + roti" },
      { breakfast: "Moong dal soup + toast", midMorning: "Warm honey water", lunch: "Chapati + brinjal + dal", evening: "Tulsi kashaya", dinner: "Khichdi" },
      { breakfast: "Warm daliya + dry ginger", midMorning: "Honey + black pepper", lunch: "Rice + patola + mudga", evening: "Warm milk", dinner: "Light soup" },
      { breakfast: "Warm milk + ghee + haldi", midMorning: "Talisadi churna + honey", lunch: "Chapati + seasonal veg + dal", evening: "Ginger + tulsi tea", dinner: "Khichdi + ghee" },
    ],
    hi: [
      { breakfast: "गर्म दूध + हल्दी + काली मिर्च", midMorning: "शहद + अदरक रस (5ml)", lunch: "गेहूँ रोटी + मूंग दाल + परवल", evening: "तुलसी + अदरक + शहद चाय", dinner: "खिचड़ी + घी" },
      { breakfast: "दलिया (गर्म) + घी", midMorning: "गर्म पानी + शहद", lunch: "चावल + पालक + दाल", evening: "पिप्पली + शहद", dinner: "सूप + नरम रोटी" },
      { breakfast: "गर्म दलिया + इलायची", midMorning: "वासा स्वरस + शहद (5ml)", lunch: "रोटी + लौकी + मूंग दाल", evening: "गर्म दूध + हल्दी", dinner: "हल्की खिचड़ी" },
      { breakfast: "रागी माल्ट (गर्म)", midMorning: "सितोपलादि चूर्ण + शहद", lunch: "चावल + सहजन सब्जी + दाल", evening: "अदरक चाय", dinner: "सब्जी सूप + रोटी" },
      { breakfast: "मूंग दाल सूप + टोस्ट", midMorning: "गर्म शहद पानी", lunch: "रोटी + बैंगन + दाल", evening: "तुलसी काढ़ा", dinner: "खिचड़ी" },
      { breakfast: "गर्म दलिया + सोंठ", midMorning: "शहद + काली मिर्च", lunch: "चावल + परवल + मूंग", evening: "गर्म दूध", dinner: "हल्का सूप" },
      { breakfast: "गर्म दूध + घी + हल्दी", midMorning: "तालीसादि चूर्ण + शहद", lunch: "रोटी + मौसमी सब्जी + दाल", evening: "अदरक + तुलसी चाय", dinner: "खिचड़ी + घी" },
    ],
  },
  notes: {
    en: "Keep warm. Avoid cold exposure. Honey with warm water is excellent. Avoid talking loudly. Steam inhalation helps.",
    hi: "गर्म रहें। ठंड से बचें। गर्म पानी + शहद उत्तम। ज़ोर से न बोलें। भाप लेना लाभदायक।",
  },
},
// ══════════ 6. GRIDHRASI (SCIATICA) ══════════
{
  id: "gridhrasi",
  diseaseKey: "gridhrasi",
  diseaseName: { en: "Gridhrasi (Sciatica)", hi: "गृध्रसी (साइटिका)" },
  pathya: {
    en: ["Wheat", "Rice", "Black gram", "Kulattha", "Garlic", "Milk", "Coconut water", "Clarified butter", "Oil", "Sesame", "Tamarind"],
    hi: ["गेहूँ", "चावल", "उड़द", "कुल्थी", "लहसुन", "दूध", "नारियल पानी", "घी", "तेल", "तिल", "इमली"],
  },
  apathya: {
    en: ["Chickpea", "Peas", "Green gram", "Bitter gourd", "Lotus stem", "Beans", "Betel nut", "Honey"],
    hi: ["चना", "मटर", "मूंग", "करेला", "कमल ककड़ी", "सेम", "सुपारी", "शहद"],
  },
  lifestylePathya: {
    en: ["Massage", "Sudation", "Anuvasana vasti", "Niruha vasti", "Virecana", "Sunlight exposure", "Nourishing diet"],
    hi: ["मालिश", "स्वेदन", "अनुवासन वस्ति", "निरूह वस्ति", "विरेचन", "धूप", "पौष्टिक आहार"],
  },
  lifestyleApathya: {
    en: ["Sadness", "Night awakening", "Fasting", "Exercise", "Excessive walking"],
    hi: ["उदासी", "रात्रि जागरण", "उपवास", "व्यायाम", "अधिक चलना"],
  },
  weeklyPlan: {
    en: [
      { breakfast: "Warm milk + garlic (2 cloves)", midMorning: "Sesame laddu", lunch: "Rice + udad dal + drumstick sabji", evening: "Warm milk + ghee", dinner: "Wheat chapati + palak + dal" },
      { breakfast: "Daliya + ghee + dry fruits", midMorning: "Warm water + castor oil (5ml)", lunch: "Chapati + brinjal + kulattha dal", evening: "Coconut water", dinner: "Khichdi + ghee" },
      { breakfast: "Warm porridge + sesame", midMorning: "Warm milk", lunch: "Rice + paravala sabji + dal", evening: "Garlic + warm milk", dinner: "Soft roti + mixed veg" },
      { breakfast: "Egg (if non-veg) / Sesame chikki", midMorning: "Warm water + lemon", lunch: "Wheat roti + drumstick + udad dal", evening: "Warm sesame oil massage", dinner: "Light soup + chapati" },
      { breakfast: "Urad dal dosa + sambar", midMorning: "Coconut water", lunch: "Rice + paravala + kulattha dal", evening: "Warm milk + turmeric", dinner: "Chapati + lauki sabji" },
      { breakfast: "Daliya + nuts", midMorning: "Warm garlic milk", lunch: "Chapati + seasonal sabji + dal", evening: "Warm water", dinner: "Khichdi + ghee" },
      { breakfast: "Warm milk + almonds + garlic", midMorning: "Sesame laddu", lunch: "Rice + brinjal + udad dal", evening: "Warm coconut water", dinner: "Nourishing soup + roti" },
    ],
    hi: [
      { breakfast: "गर्म दूध + लहसुन (2 कली)", midMorning: "तिल लड्डू", lunch: "चावल + उड़द दाल + सहजन सब्जी", evening: "गर्म दूध + घी", dinner: "गेहूँ रोटी + पालक + दाल" },
      { breakfast: "दलिया + घी + मेवे", midMorning: "गर्म पानी + अरंडी तेल (5ml)", lunch: "रोटी + बैंगन + कुल्थी दाल", evening: "नारियल पानी", dinner: "खिचड़ी + घी" },
      { breakfast: "गर्म दलिया + तिल", midMorning: "गर्म दूध", lunch: "चावल + परवल सब्जी + दाल", evening: "लहसुन + गर्म दूध", dinner: "नरम रोटी + मिक्स वेज" },
      { breakfast: "अंडा (नॉन-वेज) / तिल चिक्की", midMorning: "गर्म पानी + नींबू", lunch: "गेहूँ रोटी + सहजन + उड़द दाल", evening: "गर्म तिल तेल मालिश", dinner: "हल्का सूप + रोटी" },
      { breakfast: "उड़द दाल डोसा + सांबर", midMorning: "नारियल पानी", lunch: "चावल + परवल + कुल्थी दाल", evening: "गर्म दूध + हल्दी", dinner: "रोटी + लौकी सब्जी" },
      { breakfast: "दलिया + मेवे", midMorning: "गर्म लहसुन दूध", lunch: "रोटी + मौसमी सब्जी + दाल", evening: "गर्म पानी", dinner: "खिचड़ी + घी" },
      { breakfast: "गर्म दूध + बादाम + लहसुन", midMorning: "तिल लड्डू", lunch: "चावल + बैंगन + उड़द दाल", evening: "गर्म नारियल पानी", dinner: "पौष्टिक सूप + रोटी" },
    ],
  },
  notes: {
    en: "Oil massage (Mahanarayana taila) on lower back and legs daily. Avoid sitting for long. Hot water bag helps. Keep warm.",
    hi: "रोज कमर और पैरों पर तेल मालिश (महानारायण तेल)। अधिक देर न बैठें। गर्म पानी की बोतल लाभदायक। गर्म रहें।",
  },
},
// ══════════ 7. ARSHA (HAEMORRHOIDS) ══════════
{
  id: "arsha",
  diseaseKey: "arsha",
  diseaseName: { en: "Arsha (Haemorrhoids / Piles)", hi: "अर्श (बवासीर)" },
  pathya: {
    en: ["Wheat", "Barley", "Kulattha", "Green gram", "Bottle gourd", "Spinach", "Papaya", "Apple", "Grapes", "Amalaki", "Clarified butter", "Buttermilk", "Rock salt"],
    hi: ["गेहूँ", "जौ", "कुल्थी", "मूंग", "लौकी", "पालक", "पपीता", "सेब", "अंगूर", "आँवला", "घी", "छाछ", "सेंधा नमक"],
  },
  apathya: {
    en: ["Black gram", "Chickpea", "Potato", "Spices", "Pickle", "Sesame"],
    hi: ["उड़द", "चना", "आलू", "मसाले", "अचार", "तिल"],
  },
  lifestylePathya: {
    en: ["Physical exercise", "Vamana", "Virecana", "Anuvasana vasti", "Piccha vasti"],
    hi: ["शारीरिक व्यायाम", "वमन", "विरेचन", "अनुवासन वस्ति", "पिच्छा वस्ति"],
  },
  lifestyleApathya: {
    en: ["Day sleeping", "Suppression of natural urges", "Excessive food intake", "Sitting for long"],
    hi: ["दिन में सोना", "वेग धारण", "अधिक भोजन", "अधिक देर बैठना"],
  },
  weeklyPlan: {
    en: [
      { breakfast: "Daliya + ghee + isabgol", midMorning: "Buttermilk + cumin", lunch: "Chapati + lauki sabji + mudga dal", evening: "Papaya", dinner: "Khichdi + ghee" },
      { breakfast: "Oats + banana + flax seeds", midMorning: "Warm water + lemon", lunch: "Rice + palak + kulattha dal", evening: "Buttermilk", dinner: "Soft roti + pumpkin sabji" },
      { breakfast: "Ragi porridge + banana", midMorning: "Pomegranate juice", lunch: "Chapati + paravala + dal", evening: "Warm water + isabgol", dinner: "Light soup + roti" },
      { breakfast: "Wheat toast + ghee", midMorning: "Apple", lunch: "Rice + bottle gourd + mudga", evening: "Buttermilk + rock salt", dinner: "Khichdi" },
      { breakfast: "Daliya + dried figs", midMorning: "Warm water", lunch: "Chapati + spinach + kulattha", evening: "Papaya", dinner: "Vegetable soup" },
      { breakfast: "Poha + vegetables", midMorning: "Buttermilk", lunch: "Rice + lauki + dal", evening: "Grapes", dinner: "Soft roti + pumpkin" },
      { breakfast: "Oats + prune + warm water", midMorning: "Amla juice", lunch: "Chapati + paravala + mudga dal", evening: "Buttermilk + cumin", dinner: "Light khichdi + ghee" },
    ],
    hi: [
      { breakfast: "दलिया + घी + ईसबगोल", midMorning: "छाछ + जीरा", lunch: "रोटी + लौकी सब्जी + मूंग दाल", evening: "पपीता", dinner: "खिचड़ी + घी" },
      { breakfast: "ओट्स + केला + अलसी", midMorning: "गर्म पानी + नींबू", lunch: "चावल + पालक + कुल्थी दाल", evening: "छाछ", dinner: "नरम रोटी + कद्दू सब्जी" },
      { breakfast: "रागी दलिया + केला", midMorning: "अनार रस", lunch: "रोटी + परवल + दाल", evening: "गर्म पानी + ईसबगोल", dinner: "हल्का सूप + रोटी" },
      { breakfast: "गेहूँ टोस्ट + घी", midMorning: "सेब", lunch: "चावल + लौकी + मूंग", evening: "छाछ + सेंधा नमक", dinner: "खिचड़ी" },
      { breakfast: "दलिया + सूखी अंजीर", midMorning: "गर्म पानी", lunch: "रोटी + पालक + कुल्थी", evening: "पपीता", dinner: "सब्जी सूप" },
      { breakfast: "पोहा + सब्जियाँ", midMorning: "छाछ", lunch: "चावल + लौकी + दाल", evening: "अंगूर", dinner: "नरम रोटी + कद्दू" },
      { breakfast: "ओट्स + आलूबुखारा + गर्म पानी", midMorning: "आँवला रस", lunch: "रोटी + परवल + मूंग दाल", evening: "छाछ + जीरा", dinner: "हल्की खिचड़ी + घी" },
    ],
  },
  notes: {
    en: "Keep bowels regular. Drink plenty of warm water. Isabgol at bedtime. Avoid sitting for long on hard surfaces. Sitz bath helps.",
    hi: "मल नियमित रखें। भरपूर गर्म पानी पिएँ। रात को ईसबगोल लें। कठोर सतह पर अधिक न बैठें। सिट्ज़ बाथ लाभदायक।",
  },
},

// ══════════ 8. VIBANDHA (CONSTIPATION) ══════════
{
  id: "vibandha",
  diseaseKey: "vibandha",
  diseaseName: { en: "Vibandha (Constipation)", hi: "विबन्ध (कब्ज)" },
  pathya: {
    en: ["Old rice", "Wheat", "Green gram", "Pigeon pea", "Green vegetables", "Papaya", "Carrot", "Radish", "Cucumber", "Cabbage", "Bottle gourd", "Excess water"],
    hi: ["पुराने चावल", "गेहूँ", "मूंग", "अरहर", "हरी सब्जियाँ", "पपीता", "गाजर", "मूली", "खीरा", "पत्ता गोभी", "लौकी", "अधिक पानी"],
  },
  apathya: {
    en: ["Rice (new)", "Black gram", "Peas", "Banana", "Potato", "Spicy food", "Fast food"],
    hi: ["चावल (नया)", "उड़द", "मटर", "केला", "आलू", "मसालेदार भोजन", "फास्ट फूड"],
  },
  lifestylePathya: { en: ["Sudation", "Virecana", "Vasti", "Exercise", "Walking"], hi: ["स्वेदन", "विरेचन", "वस्ति", "व्यायाम", "चलना"] },
  lifestyleApathya: { en: ["Night awakening", "Suppression of natural urges", "Lack of exercise"], hi: ["रात्रि जागरण", "वेग धारण", "व्यायाम की कमी"] },
  weeklyPlan: {
    en: [
      { breakfast: "Warm water + lemon (empty stomach) then daliya + ghee", midMorning: "Papaya", lunch: "Wheat chapati + green veg + arhar dal", evening: "Warm water + isabgol", dinner: "Khichdi + ghee" },
      { breakfast: "Soaked raisins (10) + warm water, then oats", midMorning: "Guava / prunes", lunch: "Rice + palak + mudga dal", evening: "Warm lemon water", dinner: "Soft chapati + lauki sabji" },
      { breakfast: "Triphala water (overnight soaked) + toast", midMorning: "Papaya", lunch: "Chapati + cabbage sabji + dal", evening: "Warm water + castor oil (5ml)", dinner: "Vegetable soup" },
      { breakfast: "Fig + warm milk", midMorning: "Carrot juice", lunch: "Rice + radish sabji + dal", evening: "Isabgol + warm water", dinner: "Khichdi" },
      { breakfast: "Warm water + honey, then poha", midMorning: "Seasonal fruits", lunch: "Chapati + bottle gourd + arhar dal", evening: "Warm water", dinner: "Light soup + roti" },
      { breakfast: "Soaked almond + warm water, daliya", midMorning: "Papaya / guava", lunch: "Rice + mixed veg + mudga dal", evening: "Warm lemon water", dinner: "Chapati + pumpkin" },
      { breakfast: "Triphala water + banana", midMorning: "Cucumber juice", lunch: "Chapati + green veg + dal", evening: "Isabgol + warm milk", dinner: "Khichdi + ghee" },
    ],
    hi: [
      { breakfast: "गर्म पानी + नींबू (खाली पेट) फिर दलिया + घी", midMorning: "पपीता", lunch: "गेहूँ रोटी + हरी सब्जी + अरहर दाल", evening: "गर्म पानी + ईसबगोल", dinner: "खिचड़ी + घी" },
      { breakfast: "भिगी किशमिश (10) + गर्म पानी, फिर ओट्स", midMorning: "अमरूद / आलूबुखारा", lunch: "चावल + पालक + मूंग दाल", evening: "गर्म नींबू पानी", dinner: "नरम रोटी + लौकी सब्जी" },
      { breakfast: "त्रिफला पानी (रात भिगोया) + टोस्ट", midMorning: "पपीता", lunch: "रोटी + गोभी सब्जी + दाल", evening: "गर्म पानी + अरंडी तेल (5ml)", dinner: "सब्जी सूप" },
      { breakfast: "अंजीर + गर्म दूध", midMorning: "गाजर रस", lunch: "चावल + मूली सब्जी + दाल", evening: "ईसबगोल + गर्म पानी", dinner: "खिचड़ी" },
      { breakfast: "गर्म पानी + शहद, फिर पोहा", midMorning: "मौसमी फल", lunch: "रोटी + लौकी + अरहर दाल", evening: "गर्म पानी", dinner: "हल्का सूप + रोटी" },
      { breakfast: "भिगे बादाम + गर्म पानी, दलिया", midMorning: "पपीता / अमरूद", lunch: "चावल + मिक्स वेज + मूंग दाल", evening: "गर्म नींबू पानी", dinner: "रोटी + कद्दू" },
      { breakfast: "त्रिफला पानी + केला", midMorning: "खीरे का रस", lunch: "रोटी + हरी सब्जी + दाल", evening: "ईसबगोल + गर्म दूध", dinner: "खिचड़ी + घी" },
    ],
  },
  notes: { en: "Drink 8-10 glasses of warm water daily. Walk 30 min after meals. Never suppress urge. Triphala at bedtime is excellent.", hi: "रोज 8-10 गिलास गर्म पानी पिएँ। भोजन के बाद 30 मिनट चलें। वेग कभी न रोकें। रात को त्रिफला उत्तम।" },
},
// ══════════ 9. SANDHIVATA (OSTEOARTHRITIS) ══════════
{
  id: "sandhivata",
  diseaseKey: "sandhivata",
  diseaseName: { en: "Sandhivata (Osteoarthritis)", hi: "सन्धिवात (ऑस्टियोआर्थराइटिस)" },
  pathya: {
    en: ["Wheat", "Rice", "Black gram", "Kulattha", "Garlic", "Sesame", "Milk", "Coconut water", "Clarified butter", "Oil", "Brinjal", "Drumstick"],
    hi: ["गेहूँ", "चावल", "उड़द", "कुल्थी", "लहसुन", "तिल", "दूध", "नारियल पानी", "घी", "तेल", "बैंगन", "सहजन"],
  },
  apathya: {
    en: ["Chickpea", "Peas", "Green gram", "Bitter gourd", "Lotus stem", "Betel nut", "Honey", "Fasting"],
    hi: ["चना", "मटर", "मूंग", "करेला", "कमल ककड़ी", "सुपारी", "शहद", "उपवास"],
  },
  lifestylePathya: { en: ["Gentle pressing (Samvahana)", "Oil massage", "Sunlight exposure", "Warm bath", "Nourishing diet"], hi: ["संवाहन (हल्की मालिश)", "तेल मालिश", "धूप", "गर्म पानी स्नान", "पौष्टिक आहार"] },
  lifestyleApathya: { en: ["Night awakening", "Suppression of urges", "Excessive exercise", "Fasting", "Over eating"], hi: ["रात्रि जागरण", "वेग धारण", "अत्यधिक व्यायाम", "उपवास", "अधिक भोजन"] },
  weeklyPlan: {
    en: [
      { breakfast: "Warm milk + garlic (2 cloves) + turmeric", midMorning: "Sesame laddu", lunch: "Wheat chapati + udad dal + drumstick sabji", evening: "Warm milk + ghee", dinner: "Rice + palak + ghee" },
      { breakfast: "Ragi porridge + dry fruits", midMorning: "Warm water + castor oil (5ml)", lunch: "Rice + brinjal + kulattha dal", evening: "Coconut water", dinner: "Khichdi + ghee" },
      { breakfast: "Daliya + ghee + sesame", midMorning: "Warm milk", lunch: "Chapati + paravala + dal", evening: "Garlic + warm milk", dinner: "Soft roti + lauki" },
      { breakfast: "Warm milk + almonds + garlic", midMorning: "Sesame chikki", lunch: "Rice + drumstick + udad dal", evening: "Warm water + ginger", dinner: "Light soup + chapati" },
      { breakfast: "Urad dal dosa + ghee", midMorning: "Coconut water", lunch: "Chapati + brinjal + kulattha", evening: "Warm milk + turmeric", dinner: "Khichdi + ghee" },
      { breakfast: "Daliya + nuts + ghee", midMorning: "Warm garlic milk", lunch: "Rice + paravala + dal", evening: "Sesame laddu", dinner: "Soft roti + mixed veg" },
      { breakfast: "Warm porridge + sesame oil", midMorning: "Warm milk", lunch: "Chapati + seasonal sabji + udad dal", evening: "Warm coconut water", dinner: "Rice + dal + ghee" },
    ],
    hi: [
      { breakfast: "गर्म दूध + लहसुन (2 कली) + हल्दी", midMorning: "तिल लड्डू", lunch: "गेहूँ रोटी + उड़द दाल + सहजन सब्जी", evening: "गर्म दूध + घी", dinner: "चावल + पालक + घी" },
      { breakfast: "रागी दलिया + मेवे", midMorning: "गर्म पानी + अरंडी तेल (5ml)", lunch: "चावल + बैंगन + कुल्थी दाल", evening: "नारियल पानी", dinner: "खिचड़ी + घी" },
      { breakfast: "दलिया + घी + तिल", midMorning: "गर्म दूध", lunch: "रोटी + परवल + दाल", evening: "लहसुन + गर्म दूध", dinner: "नरम रोटी + लौकी" },
      { breakfast: "गर्म दूध + बादाम + लहसुन", midMorning: "तिल चिक्की", lunch: "चावल + सहजन + उड़द दाल", evening: "गर्म पानी + अदरक", dinner: "हल्का सूप + रोटी" },
      { breakfast: "उड़द दाल डोसा + घी", midMorning: "नारियल पानी", lunch: "रोटी + बैंगन + कुल्थी", evening: "गर्म दूध + हल्दी", dinner: "खिचड़ी + घी" },
      { breakfast: "दलिया + मेवे + घी", midMorning: "गर्म लहसुन दूध", lunch: "चावल + परवल + दाल", evening: "तिल लड्डू", dinner: "नरम रोटी + मिक्स वेज" },
      { breakfast: "गर्म दलिया + तिल तेल", midMorning: "गर्म दूध", lunch: "रोटी + मौसमी सब्जी + उड़द दाल", evening: "गर्म नारियल पानी", dinner: "चावल + दाल + घी" },
    ],
  },
  notes: { en: "Daily oil massage (Mahanarayana taila) on joints. Keep joints warm. Avoid cold exposure. Gentle exercise only — no heavy weights.", hi: "रोज जोड़ों पर तेल मालिश (महानारायण तेल)। जोड़ों को गर्म रखें। ठंड से बचें। केवल हल्का व्यायाम — भारी वजन न उठाएँ।" },
},
// ══════════ 10. SHWASA (BRONCHIAL ASTHMA) ══════════
{
  id: "shwasa",
  diseaseKey: "shwasa",
  diseaseName: { en: "Tamaka Shwasa (Bronchial Asthma)", hi: "तमक श्वास (दमा)" },
  pathya: {
    en: ["Wheat", "Barley", "Sasthika rice", "Kulattha", "Goat milk", "Old ghee", "Honey", "Black pepper", "Dry ginger", "Long pepper", "Luke warm water", "Garlic"],
    hi: ["गेहूँ", "जौ", "षष्टिक चावल", "कुल्थी", "बकरी दूध", "पुराना घी", "शहद", "काली मिर्च", "सोंठ", "पिप्पली", "गुनगुना पानी", "लहसुन"],
  },
  apathya: {
    en: ["Maize", "Chickpea flour", "Black gram", "Buffalo milk", "Curd", "Fish", "Cold water", "Potato", "Sweet potato", "Mustard leaves"],
    hi: ["मक्का", "बेसन", "उड़द", "भैंस का दूध", "दही", "मछली", "ठंडा पानी", "आलू", "शकरकंद", "सरसों का साग"],
  },
  lifestylePathya: { en: ["Vamana (therapeutic emesis)", "Virecana", "Smoking (herbal)", "Sudation", "Day sleeping (if needed)"], hi: ["वमन", "विरेचन", "धूमपान (हर्बल)", "स्वेदन", "दिन में सोना (आवश्यक हो तो)"] },
  lifestyleApathya: { en: ["Cold/rainy exposure", "Physical exercise", "Suppression of urges", "Snuffing", "Vasti"], hi: ["ठंड/बारिश में जाना", "शारीरिक व्यायाम", "वेग धारण", "नस्य", "वस्ति"] },
  weeklyPlan: {
    en: [
      { breakfast: "Warm milk + turmeric + black pepper + honey", midMorning: "Ginger + honey (1 tsp)", lunch: "Wheat chapati + kulattha dal + light sabji", evening: "Warm water + pippali", dinner: "Light khichdi + ghee" },
      { breakfast: "Barley porridge + ghee", midMorning: "Warm honey water", lunch: "Rice (little) + patola + dal", evening: "Ginger tea", dinner: "Vegetable soup + roti" },
      { breakfast: "Ragi malt + cardamom", midMorning: "Warm milk + turmeric", lunch: "Chapati + drumstick + kulattha", evening: "Sitopaladi + honey", dinner: "Khichdi" },
      { breakfast: "Toast + warm garlic milk", midMorning: "Honey + black pepper", lunch: "Barley roti + lauki + dal", evening: "Warm water + ginger", dinner: "Light soup" },
      { breakfast: "Warm daliya + long pepper", midMorning: "Honey + tulsi juice", lunch: "Chapati + seasonal veg + dal", evening: "Warm milk + ghee", dinner: "Khichdi + ghee" },
      { breakfast: "Warm milk + garlic + pepper", midMorning: "Talisadi churna + honey", lunch: "Rice + patola + kulattha dal", evening: "Ginger kashaya", dinner: "Soft roti + soup" },
      { breakfast: "Barley porridge + honey", midMorning: "Warm water + honey", lunch: "Chapati + drumstick + dal + ghee", evening: "Warm tulsi tea", dinner: "Light khichdi" },
    ],
    hi: [
      { breakfast: "गर्म दूध + हल्दी + काली मिर्च + शहद", midMorning: "अदरक + शहद (1 चम्मच)", lunch: "गेहूँ रोटी + कुल्थी दाल + हल्की सब्जी", evening: "गर्म पानी + पिप्पली", dinner: "हल्की खिचड़ी + घी" },
      { breakfast: "जौ दलिया + घी", midMorning: "गर्म शहद पानी", lunch: "चावल (कम) + परवल + दाल", evening: "अदरक चाय", dinner: "सब्जी सूप + रोटी" },
      { breakfast: "रागी माल्ट + इलायची", midMorning: "गर्म दूध + हल्दी", lunch: "रोटी + सहजन + कुल्थी", evening: "सितोपलादि + शहद", dinner: "खिचड़ी" },
      { breakfast: "टोस्ट + गर्म लहसुन दूध", midMorning: "शहद + काली मिर्च", lunch: "जौ रोटी + लौकी + दाल", evening: "गर्म पानी + अदरक", dinner: "हल्का सूप" },
      { breakfast: "गर्म दलिया + पिप्पली", midMorning: "शहद + तुलसी रस", lunch: "रोटी + मौसमी सब्जी + दाल", evening: "गर्म दूध + घी", dinner: "खिचड़ी + घी" },
      { breakfast: "गर्म दूध + लहसुन + मिर्च", midMorning: "तालीसादि चूर्ण + शहद", lunch: "चावल + परवल + कुल्थी दाल", evening: "अदरक काढ़ा", dinner: "नरम रोटी + सूप" },
      { breakfast: "जौ दलिया + शहद", midMorning: "गर्म पानी + शहद", lunch: "रोटी + सहजन + दाल + घी", evening: "गर्म तुलसी चाय", dinner: "हल्की खिचड़ी" },
    ],
  },
  notes: { en: "Avoid cold, dust, smoke. Keep chest warm. Steam inhalation with ajwain helps. Honey is excellent for Kapha. No cold water.", hi: "ठंड, धूल, धुएँ से बचें। छाती गर्म रखें। अजवाइन भाप लाभदायक। शहद कफ के लिए उत्तम। ठंडा पानी न पिएँ।" },
},
// ══════════ 11. PANDU ROGA (ANAEMIA) ══════════
{
  id: "pandu",
  diseaseKey: "pandu",
  diseaseName: { en: "Pandu Roga (Anaemia)", hi: "पाण्डु रोग (एनीमिया)" },
  pathya: {
    en: ["Barley", "Shali rice", "Green gram", "Masura dal", "Spinach", "Methi", "Carrot", "Banana", "Amalaki", "Haridra", "Garlic", "Honey", "Clarified butter", "Buttermilk", "Haritaki", "Dry ginger"],
    hi: ["जौ", "शाली चावल", "मूंग", "मसूर दाल", "पालक", "मेथी", "गाजर", "केला", "आँवला", "हल्दी", "लहसुन", "शहद", "घी", "छाछ", "हरीतकी", "सोंठ"],
  },
  apathya: {
    en: ["Black gram", "Sour substances", "Sesame", "Hingu", "Betel", "Mustard", "Alcohol", "Fish", "Excessive water"],
    hi: ["उड़द", "खट्टे पदार्थ", "तिल", "हींग", "पान", "राई", "शराब", "मछली", "अधिक पानी"],
  },
  lifestylePathya: { en: ["Mild purgation (Mridu Virecana)"], hi: ["हल्का विरेचन"] },
  lifestyleApathya: { en: ["Sunlight exposure", "Smoking", "Day sleeping", "Suppression of urges", "Exercise", "Anger"], hi: ["धूप", "धूम्रपान", "दिन में सोना", "वेग धारण", "व्यायाम", "क्रोध"] },
  weeklyPlan: {
    en: [
      { breakfast: "Ragi porridge + jaggery + ghee", midMorning: "Pomegranate juice + honey", lunch: "Rice + palak + masura dal + ghee", evening: "Amla juice (20ml)", dinner: "Chapati + methi sabji + dal" },
      { breakfast: "Beetroot + carrot juice + daliya", midMorning: "Dates (5) + warm milk", lunch: "Chapati + green veg + mudga dal", evening: "Buttermilk", dinner: "Khichdi + ghee + palak" },
      { breakfast: "Banana + warm milk + honey", midMorning: "Amla candy", lunch: "Rice + spinach + masura + lemon", evening: "Warm jaggery water", dinner: "Roti + seasonal veg + dal" },
      { breakfast: "Oats + raisins + dates", midMorning: "Pomegranate", lunch: "Chapati + beetroot sabji + dal", evening: "Warm milk + turmeric", dinner: "Khichdi + ghee" },
      { breakfast: "Ragi dosa + sambar", midMorning: "Carrot + beetroot juice", lunch: "Rice + methi + mudga dal + ghee", evening: "Amla juice", dinner: "Soft roti + palak + dal" },
      { breakfast: "Daliya + jaggery + dry fruits", midMorning: "Dates + honey", lunch: "Chapati + green veg + masura", evening: "Buttermilk + cumin", dinner: "Rice + spinach soup + ghee" },
      { breakfast: "Warm milk + banana + honey", midMorning: "Pomegranate + amla", lunch: "Rice + seasonal greens + dal + lemon", evening: "Warm water + haritaki", dinner: "Khichdi + ghee + methi" },
    ],
    hi: [
      { breakfast: "रागी दलिया + गुड़ + घी", midMorning: "अनार रस + शहद", lunch: "चावल + पालक + मसूर दाल + घी", evening: "आँवला रस (20ml)", dinner: "रोटी + मेथी सब्जी + दाल" },
      { breakfast: "चुकंदर + गाजर रस + दलिया", midMorning: "खजूर (5) + गर्म दूध", lunch: "रोटी + हरी सब्जी + मूंग दाल", evening: "छाछ", dinner: "खिचड़ी + घी + पालक" },
      { breakfast: "केला + गर्म दूध + शहद", midMorning: "आँवला कैंडी", lunch: "चावल + पालक + मसूर + नींबू", evening: "गर्म गुड़ पानी", dinner: "रोटी + मौसमी सब्जी + दाल" },
      { breakfast: "ओट्स + किशमिश + खजूर", midMorning: "अनार", lunch: "रोटी + चुकंदर सब्जी + दाल", evening: "गर्म दूध + हल्दी", dinner: "खिचड़ी + घी" },
      { breakfast: "रागी डोसा + सांबर", midMorning: "गाजर + चुकंदर रस", lunch: "चावल + मेथी + मूंग दाल + घी", evening: "आँवला रस", dinner: "नरम रोटी + पालक + दाल" },
      { breakfast: "दलिया + गुड़ + मेवे", midMorning: "खजूर + शहद", lunch: "रोटी + हरी सब्जी + मसूर", evening: "छाछ + जीरा", dinner: "चावल + पालक सूप + घी" },
      { breakfast: "गर्म दूध + केला + शहद", midMorning: "अनार + आँवला", lunch: "चावल + मौसमी हरी सब्जी + दाल + नींबू", evening: "गर्म पानी + हरीतकी", dinner: "खिचड़ी + घी + मेथी" },
    ],
  },
  notes: { en: "Iron-rich foods essential: spinach, beetroot, pomegranate, dates, jaggery. Lohasava/Dhatri Lauha as per prescription. Vitamin C (amla/lemon) helps iron absorption.", hi: "आयरन युक्त भोजन आवश्यक: पालक, चुकंदर, अनार, खजूर, गुड़। लोहासव/धात्री लौह चिकित्सक की सलाह से। विटामिन C (आँवला/नींबू) आयरन अवशोषण में सहायक।" },
},
];

// Helper: find diet chart by disease keyword
export function findDietChart(diseaseKeyword: string): DietChart | null {
  const q = diseaseKeyword.toLowerCase();
  return DIET_CHARTS.find(d =>
    d.diseaseKey.includes(q) ||
    d.diseaseName.en.toLowerCase().includes(q) ||
    d.diseaseName.hi.includes(q)
  ) || null;
}

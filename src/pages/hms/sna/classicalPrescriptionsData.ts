/**
 * CCRAS Classical Ayurvedic Prescriptions for Common Diseases
 * Source: Central Council for Research in Ayurveda and Siddha (CCRAS)
 * Department of AYUSH, Ministry of Health & Family Welfare, Govt of India (2010)
 * Only for Registered Ayurvedic Medical Practitioners
 */

export type DosageForm = "Churna" | "Kwatha" | "Swarasa" | "Vati" | "Ghrita" | "Taila" | "Avaleha" | "Arista" | "Asava" | "Bhasma" | "Rasa" | "Lepa" | "Kalka" | "Modaka" | "Lauha" | "Mandura" | "Parpati" | "Gutika" | "Paka" | "Other";

export type Formulation = {
  name: string;
  botanical?: string;
  dosageForm: string;
  dose: string;
  anupana: string;
  reference: string;
};

export type PathyaApathya = {
  cereals?: { pathya: string; apathya: string };
  pulses?: { pathya: string; apathya: string };
  fruitsVegetables?: { pathya: string; apathya: string };
  others?: { pathya: string; apathya: string };
  lifeStyle?: { pathya: string; apathya: string };
};

export type DiseaseCategory =
  | "Fever"
  | "Disorders of the Digestive System"
  | "Disorders of the Nervous System"
  | "Disorders of the Respiratory System"
  | "Disorders of E.N.T."
  | "Disorders of the Musculoskeletal System"
  | "Skin Disorders"
  | "Metabolic Disorders"
  | "Disorders of the Urinary System"
  | "Disorders of the Uro-Genitary System"
  | "Disorders of the Blood and Lymph";

export type ClassicalDisease = {
  id: number;
  name: string;
  ayurvedicName: string;
  modernName: string;
  category: DiseaseCategory;
  singleFormulations: Formulation[];
  compoundFormulations: Formulation[];
  pathyaApathya: PathyaApathya;
};

export const DISEASE_CATEGORIES: { value: DiseaseCategory; label: string; count: number }[] = [
  { value: "Fever", label: "Fever", count: 1 },
  { value: "Disorders of the Digestive System", label: "Digestive System", count: 12 },
  { value: "Disorders of the Nervous System", label: "Nervous System", count: 4 },
  { value: "Disorders of the Respiratory System", label: "Respiratory System", count: 2 },
  { value: "Disorders of E.N.T.", label: "E.N.T.", count: 2 },
  { value: "Disorders of the Musculoskeletal System", label: "Musculoskeletal", count: 5 },
  { value: "Skin Disorders", label: "Skin Disorders", count: 8 },
  { value: "Metabolic Disorders", label: "Metabolic Disorders", count: 2 },
  { value: "Disorders of the Urinary System", label: "Urinary System", count: 1 },
  { value: "Disorders of the Uro-Genitary System", label: "Uro-Genitary System", count: 4 },
  { value: "Disorders of the Blood and Lymph", label: "Blood & Lymph", count: 2 },
];

export const CLASSICAL_PRESCRIPTIONS: ClassicalDisease[] = [
// ═══════════════════════ FEVER ═══════════════════════
{
  id: 1,
  name: "Jvara",
  ayurvedicName: "Jvara",
  modernName: "Fever",
  category: "Fever",
  singleFormulations: [
    { name: "Guduchi", botanical: "Tinospora cordifolia", dosageForm: "Swarasa", dose: "10 ml BD", anupana: "Honey or Pippali Churna", reference: "A.H.U. 1/60" },
    { name: "Kirata Tikta Phanta", botanical: "Swertia chirayita", dosageForm: "Phanta", dose: "30 ml BD", anupana: "Dhanyaka leaves", reference: "S.B.M. 4/32" },
    { name: "Katuki", botanical: "Picrorrhiza kurroa", dosageForm: "Churna", dose: "3 gm BD", anupana: "Sugar", reference: "G.N. 2.1.238" },
    { name: "Musta Kwatha", botanical: "Cyperus rotundus", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "Parpata Churna", reference: "A.H.U. 40/72" },
    { name: "Pippali", botanical: "Piper longum", dosageForm: "Churna", dose: "2 gm BD", anupana: "Honey", reference: "N.A. Part-II, Pg.209" },
    { name: "Vasa", botanical: "Adhatoda vasica", dosageForm: "Swarasa", dose: "10 ml BD", anupana: "Sugar and Honey", reference: "A.S.Ci. 1/92" },
  ],
  compoundFormulations: [
    { name: "Sudarshana Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Cold water", reference: "B.R. Jwara Cikitsa" },
    { name: "Trailokya Chintamani Rasa", dosageForm: "Vati", dose: "125 mg BD", anupana: "Coconut water", reference: "B.R. Jwara Cikitsa" },
    { name: "Mrityunjaya Rasa", dosageForm: "Vati", dose: "250 mg BD", anupana: "Honey", reference: "B.R. Jwara Cikitsa" },
    { name: "Dashamula Kwatha", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "Water", reference: "B.R. Jwara Cikitsa" },
    { name: "Sanjivani Vati", dosageForm: "Vati", dose: "250 mg BD", anupana: "Ginger juice", reference: "S.S.Ma.K. 7/18-21" },
    { name: "Lakshmivilasa Rasa", dosageForm: "Vati", dose: "250 mg BD", anupana: "Betel leaf juice/Ginger juice", reference: "B.R. Jwara Cikitsa" },
    { name: "Maha Jwarankusha Rasa", dosageForm: "Vati", dose: "250 mg BD", anupana: "Ginger juice/Honey", reference: "B.R. Jwara Cikitsa" },
    { name: "Tribhuvana Kirti Rasa", dosageForm: "Vati", dose: "250 mg BD", anupana: "Ginger juice/Honey", reference: "AFI Part-I 20-20" },
    { name: "Amritarishta", dosageForm: "Arista", dose: "20 ml BD", anupana: "Equal qty. of water after meal", reference: "B.R. Jwara Cikitsa" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Old shali rice, gruel (yavagu), barley, porridge (daliya)", apathya: "" },
    pulses: { pathya: "Green gram (mudga), masura", apathya: "Chickpea (cana)" },
    fruitsVegetables: { pathya: "Tanduliyaka, patola, bitter gourd, sigru, guduchi, jivanti, grapes, kapittha, pomegranate", apathya: "" },
    others: { pathya: "Light food", apathya: "Sesame, fast/junk food, heavy indigestible food, contaminated water" },
    lifeStyle: { pathya: "Langhana, Vamana, Virecana, Vasti, snuffing, massage, rest", apathya: "Suppression of natural urges, physical exercise, day sleeping, bathing, eating before digestion of previous food" },
  },
},
// ═══════════════════════ DIGESTIVE SYSTEM ═══════════════════════
{
  id: 2,
  name: "Atisara",
  ayurvedicName: "Atisara",
  modernName: "Diarrhoea",
  category: "Disorders of the Digestive System",
  singleFormulations: [
    { name: "Nagakeshara Churna", botanical: "Mesua ferrea", dosageForm: "Churna", dose: "3 gm BD", anupana: "Butter/Honey", reference: "B.R. Atisara Cikitsa" },
    { name: "Kutajavaleha", botanical: "Holarrhena antidysenterica", dosageForm: "Avaleha", dose: "12 gm BD", anupana: "Water", reference: "B.R. Atisara Cikitsa" },
    { name: "Kutaja Twak", botanical: "Holarrhena antidysenterica", dosageForm: "Churna", dose: "3 gm BD", anupana: "Butter milk", reference: "C.S.Su. 25" },
  ],
  compoundFormulations: [
    { name: "Brhat Dadimastaka Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Butter Milk, Honey", reference: "S.S.Ma.K. 6/64" },
    { name: "Laghu Gangadhara Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Butter Milk, Honey", reference: "B.P. Atisara Adhikara" },
    { name: "Kapitthastaka Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Hot water", reference: "Y.R. Atisara Cikitsa" },
    { name: "Kutajarista", dosageForm: "Arista", dose: "20 ml BD", anupana: "Equal Qty. of water after meals", reference: "S.Y. part-1, 7th Prakarana" },
    { name: "Changeri Ghrita", dosageForm: "Ghrita", dose: "10 gm BD", anupana: "Hot water", reference: "B.P. Atisara Adhikara" },
    { name: "Karpura Rasa", dosageForm: "Vati", dose: "125 mg BD", anupana: "Honey", reference: "B.R. Atisara Cikitsa" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Old shali rice, porridge (daliya)", apathya: "Refined flour (maida)" },
    pulses: { pathya: "Masura, green gram (mudga)", apathya: "Peas (matara), black gram (udada), chickpea (cana)" },
    fruitsVegetables: { pathya: "Jambu, pomegranate, bilva, banana, bottle gourd (lauki), patola", apathya: "Jack fruit, beans, cucumber, pumpkin, plum, grapes" },
    others: { pathya: "Honey, cumin, coriander, butter milk, goat's milk", apathya: "Excess intake of water, sugarcane juice, betel nut, alcohol, curd" },
    lifeStyle: { pathya: "Fasting, sleeping, rest & relaxation", apathya: "Exercise, sudation, bathing, massage, snuffing, day sleeping, smoking, anger" },
  },
},
{
  id: 3,
  name: "Vibandha",
  ayurvedicName: "Vibandha",
  modernName: "Constipation",
  category: "Disorders of the Digestive System",
  singleFormulations: [
    { name: "Trivrit Churna", botanical: "Operculina turpethum", dosageForm: "Churna", dose: "3 gm BD", anupana: "Hot water", reference: "C.S.Su. 25" },
    { name: "Eranda Taila", botanical: "Ricinus communis", dosageForm: "Taila", dose: "10 ml BD", anupana: "Warm milk", reference: "C.S.Ci. 13/12" },
  ],
  compoundFormulations: [
    { name: "Vaishwanara Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Hot water", reference: "B.R. Amavata Cikitsa" },
    { name: "Abhayarista", dosageForm: "Arista", dose: "20 ml BD", anupana: "Equal qty. of water after meals", reference: "B.R. Arsha Cikitsa" },
    { name: "Icchabhedi Rasa", dosageForm: "Vati", dose: "250 mg BD", anupana: "Cold water", reference: "B.R. Udara Roga Cikitsa" },
    { name: "Pathyadi Kwatha", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "Water", reference: "B.R. Arsha Cikitsa" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Old rice, wheat", apathya: "Rice" },
    pulses: { pathya: "Green gram (mudga), pigeon pea (arahara)", apathya: "Black gram (udada), peas (matara)" },
    fruitsVegetables: { pathya: "Green vegetables, papaya, carrot, radish, cucumber, cabbage, bottle gourd", apathya: "Banana, potato and other tubers" },
    others: { pathya: "Excess intake of water", apathya: "Spicy food, fast food" },
    lifeStyle: { pathya: "Sudation, Virecana, Vasti, exercise, walking", apathya: "Night awakening, suppression of natural urges, lack of exercise" },
  },
},
{
  id: 4,
  name: "Parinama Shula",
  ayurvedicName: "Parinama Shula",
  modernName: "Duodenal Ulcer",
  category: "Disorders of the Digestive System",
  singleFormulations: [
    { name: "Shambuka Bhasma", botanical: "Bi-valve Shell", dosageForm: "Bhasma", dose: "250 mg BD", anupana: "Hot water", reference: "Y.R. Shula Cikitsa" },
  ],
  compoundFormulations: [
    { name: "Sutashekhara Rasa", dosageForm: "Vati", dose: "250 mg BD", anupana: "Water", reference: "Y.R. Amlapitta Cikitsa" },
    { name: "Narikela Kshara", dosageForm: "Kshara", dose: "500 mg BD", anupana: "Pippali Churna", reference: "B.P. Shula Adhikara" },
    { name: "Shulagajakeshari Rasa", dosageForm: "Vati", dose: "250 mg BD", anupana: "Betel leaf juice", reference: "B.R. Shula Roga Cikitsa" },
    { name: "Narikela Khanda", dosageForm: "Modaka", dose: "6 gm BD", anupana: "Water", reference: "B.P. Amlapitta Adhikara" },
    { name: "Shatavari Mandura", dosageForm: "Vati", dose: "500 mg BD", anupana: "Water", reference: "Y.R. Shula Cikitsa" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Old shali rice, parched roasted rice, barley powder (yava-sattu)", apathya: "Rice" },
    pulses: { pathya: "Pea soup (kalayayusha)", apathya: "Kulattha and other pulses" },
    fruitsVegetables: { pathya: "Banana, coconut", apathya: "Ginger (ardraka)" },
    others: { pathya: "Cow's milk, coconut water", apathya: "Spicy foods, mustard oil, sour food, fish, alcohol" },
    lifeStyle: { pathya: "Vamana, Virecana, Vasti", apathya: "Night awakening, sun exposure, fasting" },
  },
},
{
  id: 5,
  name: "Amlapitta",
  ayurvedicName: "Amlapitta",
  modernName: "Hyper Acidity / Acid Peptic Disorder",
  category: "Disorders of the Digestive System",
  singleFormulations: [
    { name: "Amalaki Swarasa", botanical: "Phyllanthus emblica", dosageForm: "Swarasa", dose: "10 ml BD", anupana: "", reference: "B.P. Amlapitta Adhikara" },
  ],
  compoundFormulations: [
    { name: "Kushmanda Avaleha", dosageForm: "Avaleha", dose: "12 gm BD", anupana: "Water", reference: "B.R. Amlapitta Cikitsa" },
    { name: "Narikela Khanda", dosageForm: "Modaka", dose: "6 gm BD", anupana: "Water", reference: "B.P. Amlapitta Adhikara" },
    { name: "Avipattikara Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Water", reference: "B.R. Amlapitta Cikitsa" },
    { name: "Brhat Shatavari Mandura", dosageForm: "Vati", dose: "500 mg BD", anupana: "Water", reference: "B.R. Amlapitta Cikitsa" },
    { name: "Dhatri Lauha", dosageForm: "Vati", dose: "500 mg BD", anupana: "Honey/Ghee", reference: "B.R. Sula Roga Cikitsa" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Barley", apathya: "Rice, chickpea flour (besana)" },
    pulses: { pathya: "Green gram (mudga)", apathya: "Black gram (udada), kulattha" },
    fruitsVegetables: { pathya: "Patola, bitter gourd, white gourd melon, green vegetables", apathya: "Potato, brinjal" },
    others: { pathya: "Cold water", apathya: "Sour vinegar, rock salt, spicy food, tea, coffee, alcohol, fast food" },
    lifeStyle: { pathya: "Vamana, Virecana, Vasti", apathya: "Day sleeping, suppression of natural urges" },
  },
},
{
  id: 6,
  name: "Chardi",
  ayurvedicName: "Chardi",
  modernName: "Vomiting",
  category: "Disorders of the Digestive System",
  singleFormulations: [
    { name: "Mayurapaksha Bhasma", botanical: "Peacock feather", dosageForm: "Bhasma", dose: "250 mg BD", anupana: "Honey", reference: "Y.R. Chardi Cikitsa" },
  ],
  compoundFormulations: [
    { name: "Eladi Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Honey/Sugar", reference: "B.R. Chardi Roga Cikitsa" },
    { name: "Vidangadi Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Honey", reference: "B.R. Chardi Cikitsa" },
    { name: "Guduchyadi Kwatha", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "Water", reference: "Y.R. Chardi Cikitsa" },
    { name: "Dashamularista", dosageForm: "Arista", dose: "20 ml BD", anupana: "Equal qty. of water after meals", reference: "B.R. Chardi Roga Cikitsa" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Wheat, shali rice", apathya: "" },
    pulses: { pathya: "Green gram (mudga), Chickpea (cana)", apathya: "" },
    fruitsVegetables: { pathya: "Green vegetables, lemon, pomegranate", apathya: "Beans, koshataki, black mustard, banana" },
    others: { pathya: "Cow's milk, cardamom, fennel, cumin, clove", apathya: "Excess intake of fluids" },
    lifeStyle: { pathya: "Vamana, Virecana, fragrant paste application", apathya: "Exercise, snuffing, Vasti, sudation, fear, unpleasant sight" },
  },
},
{
  id: 7,
  name: "Grahani",
  ayurvedicName: "Grahani",
  modernName: "Malabsorption Syndrome",
  category: "Disorders of the Digestive System",
  singleFormulations: [
    { name: "Takra (Butter Milk)", dosageForm: "Takra", dose: "Q.S.", anupana: "Saindhava Lavana", reference: "C.S.Ci. 15" },
  ],
  compoundFormulations: [
    { name: "Citrakadi Gutika", dosageForm: "Gutika", dose: "500 mg BD", anupana: "Lukewarm water", reference: "B.R. Grahani Cikitsa" },
    { name: "Kapitthastaka Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Lukewarm water", reference: "B.R. Grahani Cikitsa" },
    { name: "Laghu Gangadhara Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Butter Milk, Honey", reference: "B.R. Grahani Cikitsa" },
    { name: "Mustakadi Modaka", dosageForm: "Modaka", dose: "3 gm BD", anupana: "Lukewarm water", reference: "B.R. Grahani Cikitsa" },
    { name: "Agnikumara Rasa", dosageForm: "Vati", dose: "250 mg BD", anupana: "Lukewarm water", reference: "B.R. Grahani Cikitsa" },
    { name: "Panchamrita Parpati", dosageForm: "Parpati", dose: "125 mg BD", anupana: "Butter Milk", reference: "B.R. Grahani Cikitsa" },
    { name: "Mustakarista", dosageForm: "Arista", dose: "20 ml BD", anupana: "Equal qty. of water after meals", reference: "B.R. Agnimandya Cikitsa" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Old shali rice", apathya: "Wheat" },
    pulses: { pathya: "Green gram (mudga), masura, pigeon pea (arahara)", apathya: "Peas (matara)" },
    fruitsVegetables: { pathya: "Water chestnut, banana, Jambu", apathya: "Garlic" },
    others: { pathya: "Curd without cream, goat's milk, clarified butter, honey, buttermilk, cumin, coriander", apathya: "Betel nut, sour vinegar, milk, jaggery, sour/spicy food, laxatives" },
    lifeStyle: { pathya: "Vamana, fasting, Vasti", apathya: "Virecana, night awakening, excessive water, snuffing, exercise, sun exposure" },
  },
},
{
  id: 8,
  name: "Arsha",
  ayurvedicName: "Arsha",
  modernName: "Haemorrhoids",
  category: "Disorders of the Digestive System",
  singleFormulations: [
    { name: "Haritaki Churna", botanical: "Terminalia chebula", dosageForm: "Churna", dose: "3 gm BD", anupana: "Hot water", reference: "B.P.N. Haritaki Varga" },
  ],
  compoundFormulations: [
    { name: "Brhat Surana Modaka", dosageForm: "Modaka", dose: "6 gm BD", anupana: "Water/Butter milk", reference: "B.P. Arsha Adhikara" },
    { name: "Kankaayana Modaka", dosageForm: "Modaka", dose: "1 gm BD", anupana: "Butter Milk", reference: "B.R. Arsha Cikitsa" },
    { name: "Abhayarista", dosageForm: "Arista", dose: "20 ml BD", anupana: "Equal qty. of water after meals", reference: "B.R. Arsha Cikitsa" },
    { name: "Arshakuthara Rasa", dosageForm: "Vati", dose: "250 mg BD", anupana: "Hot water", reference: "B.R. Arsha Cikitsa" },
    { name: "Samasarkara Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Mishri", reference: "B.R. Arsha Cikitsa" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Sathi rice, wheat, barley", apathya: "" },
    pulses: { pathya: "Kulattha, green gram (mudga)", apathya: "Black gram (udada), chickpea (cana)" },
    fruitsVegetables: { pathya: "Bottle gourd, paravala, spinach, papaya, apple, grapes, mango, amalaki", apathya: "Potato and other tubers" },
    others: { pathya: "Clarified butter, rock salt, butter milk, cow's milk, goat's milk", apathya: "Spices, pickle, sesame" },
    lifeStyle: { pathya: "Physical exercise, Vamana, Virecana, Anuvasana vasti, Piccha vasti", apathya: "Day sleeping, suppression of natural urges, eating before digestion, excessive food" },
  },
},
// ═══════════════════════ NERVOUS SYSTEM ═══════════════════════
{
  id: 9,
  name: "Shirahshula",
  ayurvedicName: "Shirahshula",
  modernName: "Headache",
  category: "Disorders of the Nervous System",
  singleFormulations: [
    { name: "Aparmarga Taila", botanical: "Achyranthes aspera", dosageForm: "Taila (Nasya)", dose: "2 drops BD", anupana: "", reference: "B.R. Shiroroga Cikitsa" },
    { name: "Godanti Bhasma", botanical: "Gypsum", dosageForm: "Bhasma", dose: "500 mg BD", anupana: "Honey", reference: "R.T. 11/238" },
  ],
  compoundFormulations: [
    { name: "Shadbindu Taila", dosageForm: "Taila (Nasya)", dose: "3 drops BD", anupana: "", reference: "B.R. Shiroroga Cikitsa" },
    { name: "Shirahshuladrivajra Rasa", dosageForm: "Vati", dose: "250 mg BD", anupana: "Water/Honey", reference: "B.R. Shiroroga Cikitsa" },
    { name: "Mahalakshmivilasa Rasa", dosageForm: "Vati", dose: "125 mg BD", anupana: "Water/Honey", reference: "B.R. Shiroroga Cikitsa" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Wheat", apathya: "Special variety of rice (kodrava, samvaka)" },
    pulses: { pathya: "Black gram (udada)", apathya: "Green gram, pigeon pea, peas, chickpea" },
    fruitsVegetables: { pathya: "Paravala, brinjal, mango, pomegranate, phalasa, grapes, garlic, drum stick", apathya: "Jambu, bitter gourd" },
    others: { pathya: "Clarified butter, oil, milk, coconut water, sesame", apathya: "Betel nut, excessively heavy food" },
    lifeStyle: { pathya: "Massage on head, gentle pressing, rest", apathya: "Excessive exercise, suppression of natural urges, uneven bed, night awakening" },
  },
},
{
  id: 10,
  name: "Pakshaghata",
  ayurvedicName: "Pakshaghata",
  modernName: "Paralysis",
  category: "Disorders of the Nervous System",
  singleFormulations: [
    { name: "Rasna", botanical: "Pluchea lanceolata", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "Water", reference: "C.S.Su. 25/40" },
    { name: "Lashuna", botanical: "Alium sativam", dosageForm: "Kalka", dose: "3 gm BD", anupana: "Saindhava lavana", reference: "B.P. Vatavyadhi Ci. 24/343" },
  ],
  compoundFormulations: [
    { name: "Brhatvata Chintamani Rasa", dosageForm: "Vati", dose: "125 mg BD", anupana: "Honey", reference: "B.R. Vatavyadhi Cikitsa" },
    { name: "Mahanarayana Taila", dosageForm: "Taila", dose: "Q.S. Ext.", anupana: "", reference: "B.R. Vatavyadhi Cikitsa" },
    { name: "Ekangavira Rasa", dosageForm: "Vati", dose: "250 mg BD", anupana: "Honey", reference: "B.N.R." },
    { name: "Trayodashanga Guggulu", dosageForm: "Vati", dose: "1 gm BD", anupana: "Water", reference: "B.R. Vatavyadhi Cikitsa" },
    { name: "Rasaraja Rasa", dosageForm: "Vati", dose: "125 mg BD", anupana: "Honey", reference: "B.R. Vatavyadhi Cikitsa" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Wheat, shali rice", apathya: "Special variety of rice (kodrava, samvaka)" },
    pulses: { pathya: "Black gram (udada), kulattha", apathya: "Chickpea, peas, pigeon pea, green gram" },
    fruitsVegetables: { pathya: "Patola, sigru, brinjal, garlic, pomegranate, mango, lemon, grapes", apathya: "Kamalanala, beans, bitter gourd, leafy vegetables" },
    others: { pathya: "Clarified butter, oil, vasa, sesame, alcohol, milk, coconut water, tamarind", apathya: "Jambu, betel nut, pungent food, honey, contaminated water" },
    lifeStyle: { pathya: "Swimming, gentle pressing, sleeping on ground, bathing, sunlight exposure", apathya: "Night awakening, suppression of natural urges, excessive exercise, fasting" },
  },
},
{
  id: 11,
  name: "Kampavata",
  ayurvedicName: "Kampavata",
  modernName: "Parkinsonism",
  category: "Disorders of the Nervous System",
  singleFormulations: [
    { name: "Kapikacchu", botanical: "Mucuna pruriens", dosageForm: "Churna", dose: "3 gm BD", anupana: "Water", reference: "B.P. Vatavyadhi Cikitsa" },
    { name: "Ashwagandha", botanical: "Withania somnifera", dosageForm: "Churna", dose: "3 gm BD", anupana: "Water/Milk", reference: "B.P. Vatavyadhi Cikitsa" },
  ],
  compoundFormulations: [
    { name: "Mahayogaraja Guggulu", dosageForm: "Vati", dose: "500 mg BD", anupana: "Water", reference: "B.P. Vatavyadhi Cikitsa" },
    { name: "Mahanarayana Taila", dosageForm: "Taila", dose: "Q.S. Ext.", anupana: "", reference: "B.P. Vatavyadhi Cikitsa" },
    { name: "Vrhadvata Chintamani Rasa", dosageForm: "Vati", dose: "125 mg BD", anupana: "Honey/Milk/Water", reference: "B.R. Vatavyadhi Cikitsa" },
    { name: "Maharasnadi Kwatha", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "Water", reference: "B.R. Vatavyadhi Cikitsa" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Wheat, rice", apathya: "Special variety of rice (samvaka, kodrava)" },
    pulses: { pathya: "Black gram (udada), kulattha", apathya: "Peas, chickpea, pigeon pea, green gram" },
    fruitsVegetables: { pathya: "Garlic, paravala, sigru, brinjal, pomegranate, mango, grapes", apathya: "Beans, lotus stem, bitter gourd, Jambu" },
    others: { pathya: "Clarified butter, sesame oil, milk, coconut water, nourishing (brimhana), rasayana", apathya: "Betel nut, alkaline substances, honey" },
    lifeStyle: { pathya: "Unction, sudation, exercise, water exercises, gentle pressing, sunlight exposure", apathya: "Night awakening, sadness, suppression of natural urges, fasting" },
  },
},
{
  id: 12,
  name: "Gridhrasi",
  ayurvedicName: "Gridhrasi",
  modernName: "Sciatica",
  category: "Disorders of the Nervous System",
  singleFormulations: [
    { name: "Eranda Taila", botanical: "Ricinus communis", dosageForm: "Taila", dose: "10 ml BD", anupana: "Dashamula Kwatha/Shunthi Kwatha", reference: "B.R. Amavata Cikitsa" },
    { name: "Shunthi Churna", botanical: "Zingiber officinale", dosageForm: "Churna", dose: "3 gm BD", anupana: "Hot water", reference: "B.P.N. Haritakyadi Varga" },
  ],
  compoundFormulations: [
    { name: "Yogaraja Guggulu", dosageForm: "Vati", dose: "1 gm BD", anupana: "Water", reference: "B.R. Amavata Cikitsa" },
    { name: "Punarnavadi Guggulu", dosageForm: "Vati", dose: "1 gm BD", anupana: "Water", reference: "B.R. Amavata Cikitsa" },
    { name: "Narayana Taila", dosageForm: "Taila", dose: "Q.S. Ext.", anupana: "", reference: "B.R. Amavata Cikitsa" },
    { name: "Prasarani Taila", dosageForm: "Taila", dose: "Q.S. Ext.", anupana: "", reference: "B.R. Amavata Cikitsa" },
    { name: "Rasnasaptaka Kwatha", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "Water", reference: "B.R. Amavata Cikitsa" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Rice, wheat", apathya: "Special variety of rice (kodrava, samvaka)" },
    pulses: { pathya: "Black gram (udada), kulattha", apathya: "Chickpea, peas, pigeon pea, green gram" },
    fruitsVegetables: { pathya: "Garlic, brinjal, paravala, sigru, mango, pomegranate, lemon, grapes", apathya: "Bitter gourd, lotus stem, jambu, beans, leafy vegetables" },
    others: { pathya: "Milk, coconut water, tamarind, meat juice, clarified butter, oil", apathya: "Betel nut, honey" },
    lifeStyle: { pathya: "Massage, sudation, Anuvasana vasti, Niruha vasti, Virecana, gentle pressing, sunlight exposure", apathya: "Sadness, night awakening, fasting, exercise, suppression of natural urges, excessive walking" },
  },
},
// ═══════════════════════ RESPIRATORY SYSTEM ═══════════════════════
{
  id: 13,
  name: "Kasa",
  ayurvedicName: "Kasa",
  modernName: "Cough",
  category: "Disorders of the Respiratory System",
  singleFormulations: [
    { name: "Vasa Swarasa", botanical: "Adhatoda vasica", dosageForm: "Swarasa", dose: "10 ml BD", anupana: "Cow's Ghee/Honey", reference: "S.S.Ma.K. 1/8" },
    { name: "Ardraka Swarasa", botanical: "Zingiber officinale", dosageForm: "Swarasa", dose: "10 ml BD", anupana: "Cow's Ghee/Honey", reference: "S.S.Ma.K. 1/13" },
    { name: "Tulasi", botanical: "Ocimum sanctum", dosageForm: "Swarasa", dose: "5 ml BD", anupana: "Honey", reference: "C.S.Ci. 18/117" },
    { name: "Kantakari Kwatha", botanical: "Solanum xanthocarpum", dosageForm: "Kwatha", dose: "20 ml BD", anupana: "Pippali Churna", reference: "C.D. 11/25" },
  ],
  compoundFormulations: [
    { name: "Talisadi Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Honey", reference: "S.S.Ma.K. 6/132-135" },
    { name: "Agastya Haritaki Rasayana", dosageForm: "Avaleha", dose: "12 gm BD", anupana: "Water/Milk", reference: "S.S.Ma.K. 8/32-37" },
    { name: "Citraka Haritaki", dosageForm: "Avaleha", dose: "12 gm BD", anupana: "Water/Milk", reference: "B.R. Nasaroga Cikitsa" },
    { name: "Dashamula Katu Trayadi Kwatha", dosageForm: "Kwatha", dose: "20 ml BD", anupana: "Honey", reference: "S.Y.Pr.P. /171" },
    { name: "Dhanwantari Gutika", dosageForm: "Vati", dose: "250 mg BD", anupana: "Water", reference: "S.Y. Dwitiya Prakarana/65" },
    { name: "Draksharista", dosageForm: "Arista", dose: "20 ml BD", anupana: "Equal Qty. of water after meals", reference: "S.S.Ma.K. 10/69-72" },
    { name: "Kantakaryavaleha", dosageForm: "Avaleha", dose: "12 gm BD", anupana: "Water", reference: "S.S.Ma.K. 8/5-9" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Old rice, wheat, barley", apathya: "" },
    pulses: { pathya: "Soup of green gram (mudga)", apathya: "" },
    fruitsVegetables: { pathya: "Bathua, makoya, brinjal, patola, grapes", apathya: "Potato and other tubers, mustard leaf" },
    others: { pathya: "Light food, cow's milk, goat's milk, clarified butter, cardamom, garlic, luke warm water, haritaki, black pepper, dry ginger, long pepper, honey", apathya: "Dust, smoke, vidahi anna, fish, contaminated food, cold food, dry food" },
    lifeStyle: { pathya: "Day sleeping, sudation, Virecana, smoking, massage", apathya: "Vasti, snuffing, blood letting, exercise, suppression of natural urges" },
  },
},
{
  id: 14,
  name: "Tamaka Shwasa",
  ayurvedicName: "Tamaka Shwasa",
  modernName: "Bronchial Asthma",
  category: "Disorders of the Respiratory System",
  singleFormulations: [
    { name: "Ardraka Swarasa", botanical: "Zingiber officinale", dosageForm: "Swarasa", dose: "10 ml BD", anupana: "Cow's Ghee/Honey", reference: "S.S.Ma.K. 1/13" },
    { name: "Vasa Swarasa", botanical: "Adhatoda vasica", dosageForm: "Swarasa", dose: "10 ml BD", anupana: "Cow's Ghee/Honey", reference: "S.S.Ma.K. 1/8" },
  ],
  compoundFormulations: [
    { name: "Shringyadi Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Honey", reference: "B.R. Hikka Shwasa Cikitsa" },
    { name: "Shwasakuthara Rasa", dosageForm: "Vati", dose: "250 mg BD", anupana: "Ginger Juice", reference: "B.R. Hikka Shwasa Cikitsa" },
    { name: "Shwasakasa Chintamani", dosageForm: "Vati", dose: "125 mg BD", anupana: "Honey", reference: "B.R. Hikka Shwasa Cikitsa" },
    { name: "Kanakasava", dosageForm: "Asava", dose: "10 ml BD", anupana: "Equal qty. of water after meals", reference: "B.R. Hikka Shwasa Cikitsa" },
    { name: "Bharngiguda", dosageForm: "Avaleha", dose: "12 gm BD", anupana: "Water", reference: "B.P. Shwasaroga Adhikara" },
    { name: "Dashamula Kwatha", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "", reference: "B.R. Kasa Cikitsa" },
    { name: "Talisadi Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Honey", reference: "S.S.Ma.K. 6/132-135" },
    { name: "Vyoshadi Vati", dosageForm: "Vati", dose: "1 gm BD", anupana: "Hot Water", reference: "S.S.Ma.K. 7/22-23" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Wheat, barley, sasthika rice", apathya: "Maize (Makka), chickpea flour (besana)" },
    pulses: { pathya: "Kulattha", apathya: "Black gram (udada)" },
    fruitsVegetables: { pathya: "Bathua, tanduliyaka, garlic, haritaki, patola", apathya: "Tuber vegetables like potato, sweet potato, mustard leaves, lady fingers" },
    others: { pathya: "Goat milk, old clarified butter, honey, black pepper, dry ginger, long pepper, luke warm water", apathya: "Buffalo's milk, clarified butter, curd, fish, cold water" },
    lifeStyle: { pathya: "Vamana, Virecana, smoking, sudation, day sleeping", apathya: "Exposure to cold/rainy season, exercise, suppression of natural urges, snuffing, Vasti" },
  },
},
// ═══════════════════════ MUSCULOSKELETAL ═══════════════════════
{
  id: 15,
  name: "Katishula",
  ayurvedicName: "Katishula",
  modernName: "Backache",
  category: "Disorders of the Musculoskeletal System",
  singleFormulations: [
    { name: "Rasna Kwatha", botanical: "Pluchea lanceolata", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "Water", reference: "C.S.Ci. 25/40" },
    { name: "Lashuna", botanical: "Alium sativam", dosageForm: "Kalka", dose: "3 gm BD", anupana: "Saindhava lavana", reference: "B.R. Vatavyadhi Cikitsa 24/343" },
    { name: "Erandamula", botanical: "Ricinus communis", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "Water", reference: "C.S.Ci. 25/40" },
  ],
  compoundFormulations: [
    { name: "Dashamula Kwatha", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "Water", reference: "B.R. Vatavyadhi Cikitsa" },
    { name: "Maharasnadi Kwatha", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "Water", reference: "B.R. Amavata Cikitsa" },
    { name: "Mahayogaraja Guggulu", dosageForm: "Vati", dose: "500 mg BD", anupana: "Water", reference: "B.R. Vatavyadhi Cikitsa" },
    { name: "Trayodashanga Guggulu", dosageForm: "Vati", dose: "500 mg BD", anupana: "Water", reference: "B.R. Vatavyadhi Cikitsa" },
    { name: "Narayana Taila", dosageForm: "Taila", dose: "Q.S. Ext.", anupana: "", reference: "B.R. Vatavyadhi Cikitsa" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Wheat, rice", apathya: "Special variety of rice (kodrava, samvaka)" },
    pulses: { pathya: "Black gram (udada)", apathya: "Peas, Chickpea, pigeon pea" },
    fruitsVegetables: { pathya: "Garlic, drum stick, paravala, brinjal, pomegranate, mango, grapes", apathya: "Jambu, bitter gourd, lotus stem, cauliflower, lady finger" },
    others: { pathya: "Sesame, milk, coconut water, clarified butter, oil, nourishing food", apathya: "Betel nut, excessively heavy food" },
    lifeStyle: { pathya: "Bathing with warm water, gentle pressing, sleeping on ground, sunlight exposure", apathya: "Excessive exercise, lifting heavy weight, suppression of natural urges, uneven bed" },
  },
},
{
  id: 16,
  name: "Amavata",
  ayurvedicName: "Amavata",
  modernName: "Rheumatism",
  category: "Disorders of the Musculoskeletal System",
  singleFormulations: [
    { name: "Shunthi Churna", botanical: "Zingiber officinale", dosageForm: "Churna", dose: "3 gm BD", anupana: "Kanji", reference: "B.R. Amavata Cikitsa" },
    { name: "Rasna Kwatha", botanical: "Pluchea lanceolata", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "Water", reference: "B.R. Amavata Cikitsa" },
  ],
  compoundFormulations: [
    { name: "Simhanada Guggulu", dosageForm: "Vati", dose: "500 mg BD", anupana: "Hot water", reference: "B.R. Amavata Cikitsa" },
    { name: "Vaishwanara Churna", dosageForm: "Churna", dose: "3 gm BD", anupana: "Hot water", reference: "B.R. Amavata Cikitsa" },
    { name: "Rasna Saptaka Kwatha", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "Water", reference: "B.R. Amavata Cikitsa" },
    { name: "Maharasnadi Kwatha", dosageForm: "Kwatha", dose: "30 ml BD", anupana: "Water", reference: "S.S.Ma.K. 2/90-96" },
    { name: "Amavatari Rasa", dosageForm: "Vati", dose: "250 mg BD", anupana: "Water", reference: "B.R. Amavata Cikitsa" },
    { name: "Yogaraja Guggulu", dosageForm: "Vati", dose: "500 mg BD", anupana: "Hot Water", reference: "B.R. Amavata Cikitsa" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Barley, red variety of shali rice", apathya: "" },
    pulses: { pathya: "Kulathi", apathya: "Black gram (udada)" },
    fruitsVegetables: { pathya: "Drum stick, paravala, bitter gourd", apathya: "" },
    others: { pathya: "Dry ginger, ginger, ajavayana, fennel, black pepper, rock salt, hingu, garlic, cumin, butter milk, luke warm water, castor oil", apathya: "Curd, fish, jaggery, milk, incompatible food, heavy food" },
    lifeStyle: { pathya: "Sudation, lightening, walking, light exercise, woolen cloths", apathya: "Suppression of natural urges, night awakening, tension, sadness, cloudy weather" },
  },
},
// ═══════════════════════ SKIN DISORDERS ═══════════════════════
{
  id: 17,
  name: "Madhumeha",
  ayurvedicName: "Madhumeha",
  modernName: "Diabetes Mellitus",
  category: "Metabolic Disorders",
  singleFormulations: [
    { name: "Guduchi Swarasa", botanical: "Tinospora cordifolia", dosageForm: "Swarasa", dose: "10 ml BD", anupana: "Honey", reference: "A.H.Ci. 12/6" },
    { name: "Amalaki Churna", botanical: "Phyllanthus emblica", dosageForm: "Churna", dose: "6 gm BD", anupana: "Honey", reference: "A.H.Ut. 40/48" },
    { name: "Karvellaka Phala Churna", botanical: "Momordia charantia", dosageForm: "Churna", dose: "3 gm BD", anupana: "Water", reference: "D.V. (PV Sharma) vol.II, page-685" },
  ],
  compoundFormulations: [
    { name: "Nishamalaki Vati", dosageForm: "Vati", dose: "500 mg TDS", anupana: "Triphala Kashaya", reference: "A.H. Prameha Cikitsa" },
    { name: "Chandraprabha Vati", dosageForm: "Vati", dose: "500 mg BD", anupana: "Water/Milk", reference: "S.S.Ma.K." },
    { name: "Devadarvariṣṭa", dosageForm: "Arista", dose: "20 ml BD", anupana: "Equal qty. of water after meals", reference: "B.R. Prameha Cikitsa" },
    { name: "Shilajittvadi Lauha", dosageForm: "Lauha", dose: "500 mg BD", anupana: "Honey/Milk", reference: "B.R. Prameha Cikitsa" },
    { name: "Vasanta Kusumakara Rasa", dosageForm: "Rasa", dose: "125 mg BD", anupana: "Honey", reference: "R.S. Rasayana Vajikarana Adhikara" },
  ],
  pathyaApathya: {
    cereals: { pathya: "Barley, samvaka, kodrava, wheat", apathya: "Freshly harvested grains, rice" },
    pulses: { pathya: "Green gram (mudga), kulattha, pigeon pea, alasi, chickpea", apathya: "Black gram (udada)" },
    fruitsVegetables: { pathya: "Patola, bitter gourd, amalaki, haridra, kapittha, black pepper", apathya: "" },
    others: { pathya: "Honey, betel nut, rock salt", apathya: "Milk, curd, butter milk, clarified butter, oil, jaggery, alcohol, sugarcane products, betel, eating before digestion, incompatible food" },
    lifeStyle: { pathya: "Walking, playing, physical exercise, bathing", apathya: "Day sleeping, sudation, smoking, suppression of natural urges" },
  },
},
];

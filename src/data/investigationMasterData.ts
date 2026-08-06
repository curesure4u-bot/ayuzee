// Investigation Master - All sub-module data

export const ANTIBIOTIC_GROUPS = [
  "Aminoglycosides", "Carbapenems", "Cephalosporines", "Cephems",
  "Fluoroquinolones", "Folate Pathway Inhibitor", "Glycopeptide",
  "Macrolide", "Monobactam", "Nitrofurantoins", "oxazolidinone",
  "Penicillins", "Penillin/B Lactam Inhibitors", "Tetracycline",
];

export const LAB_DEPARTMENTS = [
  "HAEMATOLOGY", "BIOCHEMISTRY", "ENDOCRINOLOGY", "HORMONES",
  "IMMUNOLOGY", "SEROLOGY", "FLUIDS", "MICROBIOLOGY",
  "CLINICAL PATHOLOGY", "AYUSH",
];

export const SAMPLES = [
  "BLOOD", "SERUM", "FLUID", "SPUTUM", "URINE", "BLOOD (EDTA)",
  "SEMEN", "STOOL", "PUS", "PERICARDIAL FLUID", "GASTRIC LAVAGE",
  "SCRAP", "ASITIC FLUID PANEL", "GAL", "CSF PANEL",
  "KNEE JOINT FLUID PANEL", "PLURAL FLUID", "PLEURAL FLUID PANEL",
  "PUS (PANEL)", "SAMPLE PUS", "PYROTINEAL FLUID",
  "PERITONEAL FLUID PANEL", "GASTRIC LAVARGE", "MONTOUX TEST",
  "CSF", "TISSUE", "SCRAPPING FOR FUNGUS", "ASITIC FLUID",
  "BRONCHOSCOPY LAVAGE (BAL)", "GASTRIC LAVAGE (GAL)",
  "KNEE JOINT FLUID", "PERITONEAL FLUID", "PLEURAL FLUID",
  "BRONCHOSCOPY LAVARGE (BAL)", "BODY FLUID", "MONTOUX",
  "SLITSKIN", "VAGINAL", "BODYFLUID", "VAGINAL FLUID",
  "OTHER BODY FLUIDS", "SYNOVIAL FLUID", "SLIT SKIN",
  "OTHER SAMPLES", "SMEAR",
];

export const ORGANISMS = [
  "Escherichia coli", "Staphylococcus aureus", "Klebsiella pneumoniae",
  "Pseudomonas aeruginosa", "Streptococcus pyogenes", "Candida albicans",
  "Proteus mirabilis", "Enterococcus faecalis", "Acinetobacter baumannii",
  "MRSA", "Salmonella typhi", "Shigella", "Mycobacterium tuberculosis",
  "Helicobacter pylori", "Neisseria gonorrhoeae", "Haemophilus influenzae",
];

export const SMEARS = [
  "Peripheral Blood Smear", "Gram Stain", "AFB Stain (ZN Stain)",
  "Giemsa Stain", "KOH Mount", "Wet Mount", "Pap Smear",
  "India Ink Preparation", "Albert Stain", "Leishman Stain",
  "Reticulocyte Stain", "Malarial Parasite (MP)",
];

export const MEDICINES_LAB = [
  "Amoxicillin", "Ciprofloxacin", "Metronidazole", "Doxycycline",
  "Azithromycin", "Fluconazole", "Acyclovir", "Levofloxacin",
  "Ceftriaxone", "Amikacin", "Meropenem", "Vancomycin",
  "Linezolid", "Clindamycin", "Cotrimoxazole", "Nitrofurantoin",
  "Gentamicin", "Piperacillin-Tazobactam", "Imipenem", "Colistin",
];

export const TEST_PROFILES = [
  { name: "Complete Lipid Profile", tests: "Total Cholesterol, HDL, LDL, VLDL, Triglycerides, TC/HDL Ratio", price: 600 },
  { name: "Thyroid Function Test (TFT)", tests: "T3, T4, TSH, Free T3, Free T4", price: 800 },
  { name: "Liver Function Test (LFT)", tests: "Total Bilirubin, Direct Bilirubin, SGOT, SGPT, ALP, GGT, Total Protein, Albumin, Globulin, A/G Ratio", price: 700 },
  { name: "Kidney Function Test (KFT/RFT)", tests: "Blood Urea, Creatinine, Uric Acid, BUN, eGFR, Electrolytes (Na, K, Cl)", price: 750 },
  { name: "Complete Diabetic Panel", tests: "FBS, PPBS, HbA1c, Fructosamine, Lipid Profile, KFT, Urine Microalbumin", price: 1800 },
  { name: "Master Health Checkup", tests: "CBC, ESR, LFT, KFT, Lipid Profile, TFT, FBS, PPBS, Urine R/E, Stool R/E", price: 2500 },
  { name: "Anemia Profile", tests: "CBC, Iron, TIBC, Ferritin, Vitamin B12, Folic Acid, Reticulocyte Count", price: 1500 },
  { name: "Coagulation Profile", tests: "PT, INR, aPTT, Fibrinogen, D-Dimer, Bleeding Time, Clotting Time", price: 1200 },
  { name: "Cardiac Marker Panel", tests: "Troponin I, CK-MB, LDH, BNP/NT-proBNP, Homocysteine", price: 2000 },
  { name: "Arthritis Panel", tests: "RA Factor, Anti-CCP, CRP, ESR, Uric Acid, ANA", price: 1800 },
  { name: "TORCH Panel", tests: "Toxoplasma IgG/IgM, Rubella IgG/IgM, CMV IgG/IgM, HSV 1&2 IgG/IgM", price: 2200 },
  { name: "Prakruti Assessment Panel (AYUSH)", tests: "Nadi Analysis, Dosha Scoring, Agni Assessment, Mala/Mutra Analysis", price: 500 },
  { name: "Panchakarma Pre-Assessment", tests: "CBC, LFT, KFT, BSR, Lipid, ECG, Prakruti Assessment", price: 2000 },
];

export const INVESTIGATIONS = [
  { code: "CBC", name: "Complete Blood Count", dept: "HAEMATOLOGY", category: "Routine", sample: "BLOOD (EDTA)", tat: "2 hrs", price: 350, params: 22 },
  { code: "ESR", name: "Erythrocyte Sedimentation Rate", dept: "HAEMATOLOGY", category: "Routine", sample: "BLOOD (EDTA)", tat: "1 hr", price: 100, params: 1 },
  { code: "BT-CT", name: "Bleeding Time & Clotting Time", dept: "HAEMATOLOGY", category: "Routine", sample: "BLOOD", tat: "30 min", price: 150, params: 2 },
  { code: "PT-INR", name: "Prothrombin Time with INR", dept: "HAEMATOLOGY", category: "Special", sample: "BLOOD (Citrate)", tat: "2 hrs", price: 350, params: 3 },
  { code: "FBS", name: "Fasting Blood Sugar", dept: "BIOCHEMISTRY", category: "Routine", sample: "BLOOD", tat: "1 hr", price: 80, params: 1 },
  { code: "PPBS", name: "Post Prandial Blood Sugar", dept: "BIOCHEMISTRY", category: "Routine", sample: "BLOOD", tat: "1 hr", price: 80, params: 1 },
  { code: "RBS", name: "Random Blood Sugar", dept: "BIOCHEMISTRY", category: "Routine", sample: "BLOOD", tat: "30 min", price: 60, params: 1 },
  { code: "HBA1C", name: "Glycated Hemoglobin (HbA1c)", dept: "BIOCHEMISTRY", category: "Special", sample: "BLOOD (EDTA)", tat: "4 hrs", price: 450, params: 1 },
  { code: "LIPID", name: "Lipid Profile", dept: "BIOCHEMISTRY", category: "Profile", sample: "SERUM", tat: "4 hrs", price: 600, params: 7 },
  { code: "LFT", name: "Liver Function Test", dept: "BIOCHEMISTRY", category: "Profile", sample: "SERUM", tat: "4 hrs", price: 700, params: 10 },
  { code: "KFT", name: "Kidney Function Test", dept: "BIOCHEMISTRY", category: "Profile", sample: "SERUM", tat: "4 hrs", price: 750, params: 8 },
  { code: "TFT", name: "Thyroid Function Test", dept: "ENDOCRINOLOGY", category: "Profile", sample: "SERUM", tat: "6 hrs", price: 800, params: 5 },
  { code: "URINE-RE", name: "Urine Routine & Microscopy", dept: "CLINICAL PATHOLOGY", category: "Routine", sample: "URINE", tat: "1 hr", price: 120, params: 15 },
  { code: "STOOL-RE", name: "Stool Routine & Microscopy", dept: "CLINICAL PATHOLOGY", category: "Routine", sample: "STOOL", tat: "1 hr", price: 120, params: 8 },
  { code: "CRP", name: "C-Reactive Protein", dept: "IMMUNOLOGY", category: "Special", sample: "SERUM", tat: "4 hrs", price: 400, params: 1 },
  { code: "RA", name: "Rheumatoid Factor", dept: "SEROLOGY", category: "Special", sample: "SERUM", tat: "4 hrs", price: 350, params: 1 },
  { code: "WIDAL", name: "Widal Test", dept: "SEROLOGY", category: "Routine", sample: "SERUM", tat: "2 hrs", price: 250, params: 4 },
  { code: "HIV", name: "HIV 1 & 2 Antibody", dept: "SEROLOGY", category: "Special", sample: "SERUM", tat: "4 hrs", price: 350, params: 1 },
  { code: "HBSAG", name: "Hepatitis B Surface Antigen", dept: "SEROLOGY", category: "Special", sample: "SERUM", tat: "4 hrs", price: 300, params: 1 },
  { code: "CULTURE", name: "Culture & Sensitivity", dept: "MICROBIOLOGY", category: "Special", sample: "PUS", tat: "48-72 hrs", price: 800, params: 0 },
  { code: "AFB", name: "AFB Stain (Acid Fast Bacilli)", dept: "MICROBIOLOGY", category: "Special", sample: "SPUTUM", tat: "24 hrs", price: 250, params: 1 },
  { code: "USG-ABD", name: "Ultrasound - Abdomen & Pelvis", dept: "Radiology", category: "Radiology", sample: "N/A", tat: "Same day", price: 800, params: 0 },
  { code: "XRAY-CHEST", name: "X-Ray Chest PA View", dept: "Radiology", category: "Radiology", sample: "N/A", tat: "30 min", price: 350, params: 0 },
  { code: "ECG", name: "Electrocardiogram (12 Lead)", dept: "Radiology", category: "Radiology", sample: "N/A", tat: "15 min", price: 200, params: 0 },
  { code: "NADI", name: "Nadi Pareeksha (Digital)", dept: "AYUSH", category: "AYUSH", sample: "N/A", tat: "10 min", price: 300, params: 3 },
  { code: "PRAKRUTI", name: "Prakruti Assessment", dept: "AYUSH", category: "AYUSH", sample: "N/A", tat: "20 min", price: 500, params: 7 },
  { code: "NEIKURI", name: "Neikuri Test (Siddha)", dept: "AYUSH", category: "AYUSH", sample: "URINE", tat: "30 min", price: 200, params: 3 },
];

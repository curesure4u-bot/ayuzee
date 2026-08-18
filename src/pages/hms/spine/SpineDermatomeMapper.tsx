import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Brain, Search, Zap, Heart, Activity, Target, Eye,
  ArrowRight, ChevronDown, ChevronUp, Stethoscope,
  Leaf, Shield, Users, BookOpen, Lightbulb,
} from "lucide-react";

// ─── Comprehensive Dermatome Data ───
interface DermatomeLevel {
  id: string;
  level: string;
  region: string;
  color: string;
  nerveRoots: string;
  organs: string[];
  muscles: string[];
  dermatomeArea: string;
  diseases: DiseaseEntry[];
  ayurvedicCorrelation: string;
  marmaPoints: string[];
  treatments: string[];
  acupuncturePoints: string[];
  yogaAsanas: string[];
}

interface DiseaseEntry {
  name: string;
  category: string;
  spineConnection: string;
  prevalence: string;
}

const dermatomeData: DermatomeLevel[] = [
  {
    id: "c1-c2",
    level: "C1-C2",
    region: "Upper Cervical",
    color: "bg-violet-500",
    nerveRoots: "C1 (Suboccipital), C2 (Greater Occipital)",
    organs: ["Brain stem", "Scalp", "Inner ear", "Eyes (partial)", "Pituitary gland", "Sinuses"],
    muscles: ["Suboccipitals", "Rectus capitis", "Obliquus capitis", "Longus capitis"],
    dermatomeArea: "Posterior scalp, vertex of head, behind ear",
    diseases: [
      { name: "Cervicogenic Headache", category: "Neurological", spineConnection: "C2 nerve root compression → referred pain to head", prevalence: "Very Common" },
      { name: "Migraine (cervical origin)", category: "Neurological", spineConnection: "Trigeminocervical nucleus at C1-C2 → vascular headache trigger", prevalence: "Common" },
      { name: "Vertigo / Dizziness", category: "Vestibular", spineConnection: "Vertebral artery compression at C1-C2 → vestibular dysfunction", prevalence: "Common" },
      { name: "Tinnitus (cervical)", category: "ENT", spineConnection: "C2 nerve irritation → referred sensation to ear", prevalence: "Moderate" },
      { name: "Insomnia", category: "Sleep", spineConnection: "Upper cervical tension → sympathetic overdrive → sleep disruption", prevalence: "Common" },
      { name: "TMJ Dysfunction", category: "Musculoskeletal", spineConnection: "C1-C2 misalignment → altered jaw mechanics", prevalence: "Moderate" },
      { name: "Sinusitis (chronic)", category: "ENT", spineConnection: "C2 sympathetic link → sinus drainage impairment", prevalence: "Moderate" },
    ],
    ayurvedicCorrelation: "Shiro Marma region — Prana Vayu seat. Disturbance causes Shirahshoola (headache), Bhrama (vertigo), Anidra (insomnia).",
    marmaPoints: ["Adhipati (Crown)", "Sthapani (Third eye)", "Krikatika (C1-C2 junction)"],
    treatments: ["Nasya (primary)", "Shirodhara", "Greeva Basti (C1-C2 focus)", "Shirobasti"],
    acupuncturePoints: ["GV20 (Baihui)", "GB20 (Fengchi)", "BL10 (Tianzhu)", "GV16 (Fengfu)"],
    yogaAsanas: ["Bhramari Pranayama", "Shavasana with neck support", "Gentle neck rotations", "Viparita Karani"],
  },
  {
    id: "c3-c4",
    level: "C3-C4",
    region: "Mid Cervical",
    color: "bg-purple-500",
    nerveRoots: "C3 (Lesser Occipital, Great Auricular), C4 (Supraclavicular, Phrenic nerve origin)",
    organs: ["Diaphragm (C3-C5)", "Thyroid gland", "Vocal cords", "Neck muscles", "Upper trapezius"],
    muscles: ["Trapezius (upper)", "Levator scapulae", "Scalenes", "SCM", "Diaphragm (partial)"],
    dermatomeArea: "Lateral neck, supraclavicular region, upper shoulder",
    diseases: [
      { name: "Thyroid Disorders", category: "Endocrine", spineConnection: "C3-C4 sympathetic innervation → thyroid blood flow/function", prevalence: "Common" },
      { name: "Breathing Difficulty (mild)", category: "Respiratory", spineConnection: "C4 phrenic nerve origin → partial diaphragm weakness", prevalence: "Moderate" },
      { name: "Neck Stiffness / Torticollis", category: "Musculoskeletal", spineConnection: "C3-C4 nerve irritation → SCM/trapezius spasm", prevalence: "Very Common" },
      { name: "Voice Changes / Hoarseness", category: "ENT", spineConnection: "C3-C4 sympathetic link to larynx", prevalence: "Rare" },
      { name: "Hiccups (chronic)", category: "Neurological", spineConnection: "C4 phrenic nerve irritation → diaphragm spasm", prevalence: "Rare" },
      { name: "Upper Shoulder Pain", category: "Musculoskeletal", spineConnection: "C4 dermatome → referred pain to shoulder cap", prevalence: "Very Common" },
    ],
    ayurvedicCorrelation: "Manyastambha region — Vyana Vayu affected. Disturbed leads to Galaganda (thyroid), Swarabhanga (voice loss), Kantha Shoola.",
    marmaPoints: ["Manya (Carotid)", "Nila (Throat)", "Sira Matrika (Neck vessels)"],
    treatments: ["Greeva Basti", "Nasya", "Dhoomapana (herbal smoking)", "Gandusha (oil gargling)"],
    acupuncturePoints: ["LI18 (Futu)", "ST9 (Renying)", "CV22 (Tiantu)", "GB21 (Jianjing)"],
    yogaAsanas: ["Matsyasana (Fish pose)", "Sarvangasana (shoulder stand)", "Ujjayi Pranayama", "Simhasana (Lion pose)"],
  },
  {
    id: "c5-c6",
    level: "C5-C6",
    region: "Lower Cervical",
    color: "bg-blue-500",
    nerveRoots: "C5 (Axillary, Musculocutaneous), C6 (Radial nerve contribution)",
    organs: ["Shoulder joint", "Biceps", "Wrist extensors", "Thumb/Index finger", "Upper lungs"],
    muscles: ["Deltoid", "Biceps", "Brachialis", "Brachioradialis", "Wrist extensors", "Supinator"],
    dermatomeArea: "Lateral arm, lateral forearm, thumb and index finger",
    diseases: [
      { name: "Frozen Shoulder (Adhesive Capsulitis)", category: "Musculoskeletal", spineConnection: "C5 nerve root → deltoid/rotator cuff weakness → capsular restriction", prevalence: "Very Common" },
      { name: "Biceps Tendinopathy", category: "Musculoskeletal", spineConnection: "C5-C6 nerve root → biceps weakness/pain", prevalence: "Common" },
      { name: "Carpal Tunnel Syndrome", category: "Neurological", spineConnection: "C6 nerve root compression + distal entrapment (double crush)", prevalence: "Common" },
      { name: "Tennis Elbow (Lateral Epicondylitis)", category: "Musculoskeletal", spineConnection: "C5-C6 radial nerve → extensor muscle strain", prevalence: "Common" },
      { name: "Thumb/Index Numbness", category: "Neurological", spineConnection: "C6 dermatome → sensory loss in thumb/index", prevalence: "Very Common" },
      { name: "Asthma (cervical contribution)", category: "Respiratory", spineConnection: "C5 phrenic nerve + sympathetic chain → bronchospasm", prevalence: "Moderate" },
    ],
    ayurvedicCorrelation: "Amsa region — Avabahuka (frozen shoulder) is classic C5-C6 Vata Vikara. Bahu Shosha (arm wasting) indicates nerve damage.",
    marmaPoints: ["Amsa (Shoulder tip)", "Amsaphalaka (Scapula)", "Kurpara (Elbow)"],
    treatments: ["Greeva Basti", "Patra Pinda Sweda (shoulder)", "Pichu on shoulder", "Nasya"],
    acupuncturePoints: ["LI15 (Jianyu)", "LI11 (Quchi)", "LI4 (Hegu)", "SJ14 (Jianliao)", "LU7 (Lieque)"],
    yogaAsanas: ["Garudasana (Eagle arms)", "Gomukhasana (Cow face)", "Wall push-ups", "Pendulum exercises"],
  },
  {
    id: "c7-t1",
    level: "C7-T1",
    region: "Cervicothoracic Junction",
    color: "bg-cyan-500",
    nerveRoots: "C7 (Radial nerve main), C8-T1 (Ulnar nerve, Median nerve)",
    organs: ["Hand intrinsics", "Forearm flexors", "Ring/Little finger", "Stellate ganglion", "Heart (sympathetic)"],
    muscles: ["Triceps", "Flexor digitorum", "Interossei", "Lumbricals", "Opponens pollicis"],
    dermatomeArea: "Middle finger (C7), Ring/little finger and medial forearm (C8-T1)",
    diseases: [
      { name: "Hand Weakness / Grip Loss", category: "Neurological", spineConnection: "C8-T1 ulnar/median nerve → intrinsic hand muscle weakness", prevalence: "Common" },
      { name: "Cubital Tunnel Syndrome", category: "Neurological", spineConnection: "C8-T1 ulnar nerve → elbow entrapment", prevalence: "Common" },
      { name: "Ring/Little Finger Numbness", category: "Neurological", spineConnection: "C8 dermatome → ulnar nerve distribution", prevalence: "Very Common" },
      { name: "Raynaud's Phenomenon", category: "Vascular", spineConnection: "T1 stellate ganglion → digital artery vasospasm", prevalence: "Moderate" },
      { name: "Palpitations (cervical origin)", category: "Cardiac", spineConnection: "T1 sympathetic → cardiac accelerator nerve irritation", prevalence: "Moderate" },
      { name: "Writer's Cramp / Dystonia", category: "Neurological", spineConnection: "C7-T1 motor output → forearm/hand dystonic contraction", prevalence: "Rare" },
    ],
    ayurvedicCorrelation: "Hasta-Bahu junction — Vata Nanatmaja diseases of hand. Apatantraka (spasm), Pani Daha (burning palms). Heart connection = Hridaya Dhatu link.",
    marmaPoints: ["Kurpara (Elbow)", "Manibandha (Wrist)", "Kshipra (Web space thumb-index)"],
    treatments: ["Greeva Basti (C7-T1 focus)", "Hasta Abhyanga (hand oil massage)", "Pichu on elbow/wrist", "Nasya"],
    acupuncturePoints: ["HT7 (Shenmen)", "PC6 (Neiguan)", "SI3 (Houxi)", "TE5 (Waiguan)"],
    yogaAsanas: ["Wrist circles", "Finger extensions", "Prayer stretch", "Hasta Mudras (Vayu/Prana)"],
  },
  {
    id: "t2-t4",
    level: "T2-T4",
    region: "Upper Thoracic",
    color: "bg-teal-500",
    nerveRoots: "T2-T4 Intercostal nerves, Sympathetic chain (cardiac accelerator)",
    organs: ["Heart", "Lungs (upper lobes)", "Bronchi", "Esophagus (upper)", "Chest wall"],
    muscles: ["Intercostals (upper)", "Rhomboids", "Middle trapezius", "Serratus anterior"],
    dermatomeArea: "Upper chest, inner arm (T2), nipple line approaches T4",
    diseases: [
      { name: "Angina-like Chest Pain", category: "Cardiac", spineConnection: "T2-T4 sympathetic → cardiac referred pain (non-cardiac chest pain)", prevalence: "Common" },
      { name: "Palpitations / Tachycardia", category: "Cardiac", spineConnection: "T2-T3 cardiac accelerator nerve → heart rate increase", prevalence: "Common" },
      { name: "Bronchial Asthma", category: "Respiratory", spineConnection: "T2-T4 sympathetic → bronchomotor tone → bronchoconstriction", prevalence: "Common" },
      { name: "Upper Back Pain (inter-scapular)", category: "Musculoskeletal", spineConnection: "T2-T4 facet/costovertebral dysfunction", prevalence: "Very Common" },
      { name: "GERD / Acid Reflux", category: "GI", spineConnection: "T3-T4 sympathetic → lower esophageal sphincter dysfunction", prevalence: "Common" },
      { name: "Anxiety / Panic Attacks", category: "Psychological", spineConnection: "T2-T4 sympathetic overdrive → fight-or-flight activation", prevalence: "Common" },
    ],
    ayurvedicCorrelation: "Hridaya (Heart) region — Vyana Vayu + Sadhaka Pitta seat. Hrid Drava (palpitation), Urakshata (chest pain), Shwasa (dyspnea).",
    marmaPoints: ["Hridaya Marma (Heart center)", "Stanamula (Breast root)", "Brihati (Upper back)"],
    treatments: ["Hridaya Basti (oil on chest)", "Prishtha Basti (upper back)", "Shirodhara (anxiety)", "Abhyanga + Swedana"],
    acupuncturePoints: ["BL13 (Feishu-Lung)", "BL14 (Jueyinshu)", "BL15 (Xinshu-Heart)", "CV17 (Shanzhong)"],
    yogaAsanas: ["Bhujangasana (Cobra)", "Dhanurasana (Bow)", "Anulom Vilom Pranayama", "Ustrasana (Camel)"],
  },
  {
    id: "t5-t9",
    level: "T5-T9",
    region: "Mid Thoracic",
    color: "bg-emerald-500",
    nerveRoots: "T5-T9 Intercostal nerves, Greater splanchnic nerve (T5-T9)",
    organs: ["Stomach", "Liver", "Gallbladder", "Pancreas", "Spleen", "Small intestine (upper)", "Adrenal glands"],
    muscles: ["Intercostals (mid)", "Rectus abdominis (upper)", "External obliques", "Erector spinae (thoracic)"],
    dermatomeArea: "Mid-chest to upper abdomen (T5=nipple line to T9=above umbilicus)",
    diseases: [
      { name: "Diabetes (Type 2 — nerve connection)", category: "Endocrine", spineConnection: "T7-T9 splanchnic nerve → pancreatic function regulation", prevalence: "Common" },
      { name: "Gastritis / Hyperacidity", category: "GI", spineConnection: "T5-T7 sympathetic → gastric acid secretion imbalance", prevalence: "Very Common" },
      { name: "Gallbladder Disease", category: "GI", spineConnection: "T6-T8 right sympathetic → gallbladder motility", prevalence: "Common" },
      { name: "Liver Disorders (Fatty liver)", category: "GI", spineConnection: "T6-T9 sympathetic → hepatic blood flow regulation", prevalence: "Common" },
      { name: "Adrenal Fatigue / Stress", category: "Endocrine", spineConnection: "T9 splanchnic → adrenal medulla stimulation", prevalence: "Common" },
      { name: "Mid-back Burning Pain", category: "Musculoskeletal", spineConnection: "T5-T9 facet arthropathy / costovertebral dysfunction", prevalence: "Very Common" },
      { name: "Psoriasis / Eczema (thoracic)", category: "Dermatological", spineConnection: "T5-T9 sympathetic → skin blood flow + immune modulation", prevalence: "Moderate" },
    ],
    ayurvedicCorrelation: "Agni Sthana — Pachaka Pitta + Samana Vayu. Amlapitta (acidity), Yakrit Vikara (liver), Prameha (diabetes). Central digestive fire regulation.",
    marmaPoints: ["Nabhi (Umbilicus)", "Parshva Sandhi (Flanks)", "Vrihati (Back of T5-T9)"],
    treatments: ["Prishtha Basti (T5-T9)", "Virechana (purgation)", "Udwarthanam (herbal powder massage)", "Takradhara (buttermilk pouring)"],
    acupuncturePoints: ["BL18 (Ganshu-Liver)", "BL19 (Danshu-GB)", "BL20 (Pishu-Spleen)", "BL21 (Weishu-Stomach)", "CV12 (Zhongwan)"],
    yogaAsanas: ["Ardha Matsyendrasana (Twist)", "Paschimottanasana", "Mandukasana (Frog — diabetes)", "Mayurasana (Peacock — digestion)"],
  },
  {
    id: "t10-t12",
    level: "T10-T12",
    region: "Lower Thoracic",
    color: "bg-green-500",
    nerveRoots: "T10-T12 Intercostal/Subcostal nerves, Lesser splanchnic (T10-T11), Least splanchnic (T12)",
    organs: ["Kidneys", "Ureters", "Large intestine (ascending/transverse)", "Appendix", "Skin (abdominal)"],
    muscles: ["Rectus abdominis (lower)", "Internal obliques", "Transversus abdominis", "Quadratus lumborum (upper)"],
    dermatomeArea: "Periumbilical (T10) to suprapubic (T12), flanks",
    diseases: [
      { name: "Kidney Stones / Renal Colic", category: "Urological", spineConnection: "T10-T12 splanchnic → renal pelvis innervation → referred loin pain", prevalence: "Common" },
      { name: "IBS (Irritable Bowel Syndrome)", category: "GI", spineConnection: "T10-T12 sympathetic → colonic motility dysregulation", prevalence: "Very Common" },
      { name: "Chronic Constipation", category: "GI", spineConnection: "T11-T12 → ascending colon peristalsis impairment", prevalence: "Very Common" },
      { name: "Psoriasis (lower trunk)", category: "Dermatological", spineConnection: "T10-T12 autonomic → skin immune/vascular response", prevalence: "Moderate" },
      { name: "Appendicitis (referred pain)", category: "GI", spineConnection: "T10 visceral afferent → periumbilical referred pain", prevalence: "Moderate" },
      { name: "Abdominal Wall Pain", category: "Musculoskeletal", spineConnection: "T10-T12 nerve entrapment at rectus sheath", prevalence: "Common" },
    ],
    ayurvedicCorrelation: "Pakvashaya (colon) + Vrikka (kidney) region. Mutrakrichra (urinary disorders), Vibandha (constipation), Udara Shoola (abdominal pain).",
    marmaPoints: ["Nabhi (Navel)", "Basti (Lower abdomen)", "Parshva Sandhi (Flanks)"],
    treatments: ["Kati Basti (T10-L1 junction)", "Virechana", "Basti (enema therapy)", "Takradhara"],
    acupuncturePoints: ["BL22 (Sanjiaoshu)", "BL23 (Shenshu-Kidney)", "ST25 (Tianshu-Colon)", "CV8 (Shenque)"],
    yogaAsanas: ["Pawanmuktasana (Wind release)", "Dhanurasana", "Halasana (Plough)", "Nauli Kriya"],
  },
  {
    id: "l1-l3",
    level: "L1-L3",
    region: "Upper Lumbar",
    color: "bg-yellow-500",
    nerveRoots: "L1 (Iliohypogastric, Ilioinguinal), L2 (Genitofemoral, Lateral femoral cutaneous), L3 (Obturator, Femoral)",
    organs: ["Uterus", "Ovaries", "Testes", "Bladder (partial)", "Prostate", "Colon (descending)", "Hip joint"],
    muscles: ["Psoas major", "Iliacus", "Quadriceps (partial)", "Adductors", "Sartorius"],
    dermatomeArea: "Groin, anterior thigh (upper), medial thigh (L3)",
    diseases: [
      { name: "PCOD / Menstrual Disorders", category: "Gynecological", spineConnection: "L1-L2 sympathetic → ovarian/uterine blood flow regulation", prevalence: "Very Common" },
      { name: "Infertility (functional)", category: "Reproductive", spineConnection: "L1-L3 pelvic splanchnic → reproductive organ innervation", prevalence: "Common" },
      { name: "Erectile Dysfunction", category: "Urological", spineConnection: "L1-L2 sympathetic → penile vascular control", prevalence: "Common" },
      { name: "Meralgia Paresthetica", category: "Neurological", spineConnection: "L2-L3 lateral femoral cutaneous nerve entrapment", prevalence: "Common" },
      { name: "Hip Pain (anterior)", category: "Musculoskeletal", spineConnection: "L3 femoral nerve → hip flexor/quadriceps weakness", prevalence: "Very Common" },
      { name: "Constipation (chronic)", category: "GI", spineConnection: "L1-L2 → descending colon motility via sympathetic chain", prevalence: "Common" },
      { name: "Groin Pain / Hernia", category: "Musculoskeletal", spineConnection: "L1 ilioinguinal nerve → groin referred pain / weakness", prevalence: "Common" },
    ],
    ayurvedicCorrelation: "Apana Vayu seat (partially). Vandhyatva (infertility), Artava Dushti (menstrual disorders), Mutra Vikara. Reproductive Dhatu nourishment.",
    marmaPoints: ["Lohitaksha (Groin)", "Vitapa (Inguinal)", "Kukundara (Sacral — nearby)"],
    treatments: ["Kati Basti", "Uttara Basti (uterine)", "Yoni Pichu (vaginal)", "Matra Basti"],
    acupuncturePoints: ["ST30 (Qichong)", "SP12 (Chongmen)", "CV3 (Zhongji)", "BL25 (Dachangshu)"],
    yogaAsanas: ["Baddha Konasana (Butterfly)", "Supta Baddha Konasana", "Ashwini Mudra", "Mula Bandha"],
  },
  {
    id: "l4-l5",
    level: "L4-L5",
    region: "Lower Lumbar",
    color: "bg-orange-500",
    nerveRoots: "L4 (Femoral nerve terminal), L5 (Peroneal nerve, Tibial nerve contribution)",
    organs: ["Knee joint", "Ankle/Foot", "Lower leg", "Bladder (motor)", "Prostate"],
    muscles: ["Quadriceps (L4)", "Tibialis anterior (L4)", "Extensor hallucis longus (L5)", "Gluteus medius (L5)", "Peronei (L5)"],
    dermatomeArea: "Medial leg + medial foot (L4), Lateral leg + dorsum of foot + big toe (L5)",
    diseases: [
      { name: "Sciatica / Gridhrasi", category: "Neurological", spineConnection: "L4-L5 disc → nerve root compression → leg pain", prevalence: "Very Common" },
      { name: "Disc Herniation (L4-L5)", category: "Musculoskeletal", spineConnection: "Most common disc level for herniation", prevalence: "Very Common" },
      { name: "Foot Drop", category: "Neurological", spineConnection: "L5 nerve root → peroneal nerve → tibialis anterior paralysis", prevalence: "Moderate" },
      { name: "Knee Pain (medial)", category: "Musculoskeletal", spineConnection: "L4 femoral nerve → VMO weakness → medial knee stress", prevalence: "Very Common" },
      { name: "Ankle Instability", category: "Musculoskeletal", spineConnection: "L5 peroneal nerve → eversion weakness → ankle gives way", prevalence: "Common" },
      { name: "Bladder Dysfunction (partial)", category: "Urological", spineConnection: "L4-L5 contribution to bladder detrusor innervation", prevalence: "Moderate" },
      { name: "Big Toe Numbness", category: "Neurological", spineConnection: "L5 dermatome — hallux sensory supply", prevalence: "Very Common" },
    ],
    ayurvedicCorrelation: "Gridhrasi (Sciatica) — Vata Nanatmaja Vikara. Kati Shoola (low back pain), Janu Shoola (knee pain from nerve). Asthi-Majja Dhatu Kshaya.",
    marmaPoints: ["Kukundara (L4-L5 junction)", "Katikataruna (Hip)", "Janu (Knee)", "Gulpha (Ankle)"],
    treatments: ["Kati Basti (primary)", "Tikta Ksheer Basti × 16", "Agnikarma (trigger points)", "Patra Pinda Sweda"],
    acupuncturePoints: ["BL40 (Weizhong)", "BL60 (Kunlun)", "GB34 (Yanglingquan)", "ST36 (Zusanli)", "Huatuojiaji L4-L5"],
    yogaAsanas: ["Cat-Cow (Marjaryasana)", "Bird-Dog", "Setu Bandhasana (Bridge)", "Supta Padangusthasana"],
  },
  {
    id: "s1-s3",
    level: "S1-S3",
    region: "Sacral",
    color: "bg-red-500",
    nerveRoots: "S1 (Tibial nerve, Sural nerve), S2-S3 (Pudendal nerve, Pelvic splanchnic nerves)",
    organs: ["Calf", "Sole of foot", "Bladder (sensory)", "Rectum", "Sexual organs", "Pelvic floor"],
    muscles: ["Gastrocnemius (S1)", "Soleus (S1)", "Hamstrings (S1-S2)", "Gluteus maximus (S1)", "Pelvic floor (S2-S3)"],
    dermatomeArea: "Posterior leg, lateral foot, sole (S1), Posterior thigh + perineum (S2-S3)",
    diseases: [
      { name: "Sciatica (S1 component)", category: "Neurological", spineConnection: "L5-S1 disc → S1 nerve → calf pain + ankle reflex loss", prevalence: "Very Common" },
      { name: "Plantar Fasciitis", category: "Musculoskeletal", spineConnection: "S1 tibial nerve → calf tightness → plantar fascia overload", prevalence: "Very Common" },
      { name: "Piles / Hemorrhoids", category: "GI", spineConnection: "S2-S3 pudendal + pelvic splanchnic → rectal venous dysfunction", prevalence: "Very Common" },
      { name: "Fissure / Fistula", category: "GI", spineConnection: "S2-S3 pudendal → anal sphincter tone dysregulation", prevalence: "Common" },
      { name: "Erectile Dysfunction (S2-S4)", category: "Urological", spineConnection: "S2-S4 parasympathetic → penile erection pathway", prevalence: "Common" },
      { name: "Urinary Incontinence", category: "Urological", spineConnection: "S2-S3 → bladder detrusor + sphincter coordination", prevalence: "Common" },
      { name: "Coccydynia (Tailbone pain)", category: "Musculoskeletal", spineConnection: "S3-Coccyx → coccygeal plexus irritation", prevalence: "Common" },
      { name: "Sexual Dysfunction (Female)", category: "Gynecological", spineConnection: "S2-S3 → clitoral/vaginal sensory + lubrication", prevalence: "Common" },
    ],
    ayurvedicCorrelation: "Apana Vayu primary seat — controls all downward movements. Arsha (piles), Bhagandara (fistula), Mutra Atipravritti (incontinence), Klaibya (impotence).",
    marmaPoints: ["Guda (Anal)", "Basti (Bladder)", "Vitapa (Perineum)", "Kukundara (Sacral)"],
    treatments: ["Kati Basti (sacral)", "Ksharasutra (piles/fistula)", "Matra Basti", "Uttara Basti", "Pichu (vaginal/rectal)"],
    acupuncturePoints: ["BL27 (Xiaochangshu)", "BL28 (Pangguangshu)", "BL54 (Zhibian)", "GV1 (Changqiang)", "CV2 (Qugu)"],
    yogaAsanas: ["Ashwini Mudra (Anal lock)", "Mula Bandha", "Malasana (Squat)", "Setu Bandhasana"],
  },
];

// ─── Disease Category Colors ───
const categoryColors: Record<string, string> = {
  Neurological: "bg-purple-100 text-purple-700",
  Musculoskeletal: "bg-blue-100 text-blue-700",
  GI: "bg-amber-100 text-amber-700",
  Cardiac: "bg-red-100 text-red-700",
  Respiratory: "bg-cyan-100 text-cyan-700",
  Endocrine: "bg-pink-100 text-pink-700",
  Urological: "bg-green-100 text-green-700",
  Gynecological: "bg-rose-100 text-rose-700",
  Reproductive: "bg-rose-100 text-rose-700",
  Vestibular: "bg-indigo-100 text-indigo-700",
  ENT: "bg-teal-100 text-teal-700",
  Sleep: "bg-indigo-100 text-indigo-700",
  Dermatological: "bg-orange-100 text-orange-700",
  Vascular: "bg-red-100 text-red-700",
  Psychological: "bg-violet-100 text-violet-700",
};

export default function SpineDermatomeMapper() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["diseases"]));
  const [viewMode, setViewMode] = useState<"spine" | "disease" | "organ">("spine");

  const selected = dermatomeData.find(d => d.id === selectedLevel);

  // Search across all levels
  const searchResults = searchQuery.trim().length >= 2
    ? dermatomeData.flatMap(level =>
        level.diseases
          .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.category.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(d => ({ ...d, level: level.level, levelId: level.id, region: level.region }))
      )
    : [];

  // Organ search
  const organResults = searchQuery.trim().length >= 2
    ? dermatomeData.filter(level =>
        level.organs.some(o => o.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  // All diseases flat list
  const allDiseases = dermatomeData.flatMap(level =>
    level.diseases.map(d => ({ ...d, level: level.level, levelId: level.id }))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-600" />
            Dermatome Disease Mapper
          </h1>
          <p className="text-muted-foreground mt-1">
            Interactive spine level → organ → disease mapping tool for clinical correlation & patient education
          </p>
        </div>
        <Badge className="bg-indigo-100 text-indigo-700">
          <Lightbulb className="h-3 w-3 mr-1" /> Tool #3 of 5
        </Badge>
      </div>

      {/* Search + View Mode */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search disease, organ, or symptom (e.g. Sciatica, Kidney, Numbness)..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-1">
              {(["spine", "disease", "organ"] as const).map(mode => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="capitalize"
                >
                  {mode === "spine" ? "Spine View" : mode === "disease" ? "Disease View" : "Organ View"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery.trim().length >= 2 && (searchResults.length > 0 || organResults.length > 0) && (
        <Card className="border-indigo-200 bg-indigo-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Search Results ({searchResults.length} diseases, {organResults.length} organ matches)</CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length > 0 && (
              <div className="space-y-1 mb-3">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedLevel(r.levelId); setSearchQuery(""); }}
                    className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-indigo-100 transition text-xs"
                  >
                    <Badge variant="outline" className="text-[9px] shrink-0">{r.level}</Badge>
                    <span className="font-medium">{r.name}</span>
                    <Badge className={`${categoryColors[r.category] || "bg-gray-100 text-gray-700"} text-[9px]`}>{r.category}</Badge>
                    <span className="text-muted-foreground ml-auto">{r.region}</span>
                  </button>
                ))}
              </div>
            )}
            {organResults.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-muted-foreground uppercase">Organ Matches:</p>
                {organResults.map(level => (
                  <button
                    key={level.id}
                    onClick={() => { setSelectedLevel(level.id); setSearchQuery(""); }}
                    className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-indigo-100 transition text-xs"
                  >
                    <Badge variant="outline" className="text-[9px]">{level.level}</Badge>
                    <span className="text-muted-foreground">{level.organs.filter(o => o.toLowerCase().includes(searchQuery.toLowerCase())).join(", ")}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Spine Column (Interactive) */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" /> Spinal Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {dermatomeData.map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition ${
                    selectedLevel === level.id
                      ? "bg-indigo-100 border-2 border-indigo-400 ring-1 ring-indigo-200"
                      : "hover:bg-muted border border-transparent"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${level.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs">{level.level}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{level.region}</p>
                  </div>
                  <Badge variant="secondary" className="text-[8px] shrink-0">{level.diseases.length}</Badge>
                </button>
              ))}

              {/* Stats */}
              <Separator className="my-2" />
              <div className="text-center text-[10px] text-muted-foreground space-y-0.5">
                <p><strong>{dermatomeData.length}</strong> spinal levels mapped</p>
                <p><strong>{allDiseases.length}</strong> diseases correlated</p>
                <p><strong>{dermatomeData.reduce((s, d) => s + d.organs.length, 0)}</strong> organs covered</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-9 space-y-4">
          {!selected ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Brain className="h-14 w-14 mx-auto text-muted-foreground/20 mb-3" />
                <h3 className="font-medium text-muted-foreground">Select a Spinal Level</h3>
                <p className="text-xs text-muted-foreground mt-1">Click any level on the left to see organs, diseases, and treatment correlations</p>
                <p className="text-xs text-muted-foreground mt-3">Or search for a disease/organ above to find its spinal connection</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Level Header */}
              <Card className="border-l-4 border-l-indigo-500">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${selected.color}`} />
                        {selected.level} — {selected.region}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">{selected.nerveRoots}</p>
                    </div>
                    <Badge variant="outline">{selected.diseases.length} diseases mapped</Badge>
                  </div>
                  <p className="text-xs mt-2"><strong>Dermatome Area:</strong> {selected.dermatomeArea}</p>
                </CardContent>
              </Card>

              {/* Organs & Muscles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-red-500" /> Organs Innervated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {selected.organs.map(organ => (
                        <Badge key={organ} variant="secondary" className="text-[10px]">{organ}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <Grip className="h-3.5 w-3.5 text-blue-500" /> Muscles (Myotome)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {selected.muscles.map(muscle => (
                        <Badge key={muscle} variant="outline" className="text-[10px]">{muscle}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Diseases */}
              <Card>
                <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection("diseases")}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5 text-purple-500" /> Diseases Connected ({selected.diseases.length})
                    </CardTitle>
                    {expandedSections.has("diseases") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CardHeader>
                {expandedSections.has("diseases") && (
                  <CardContent className="space-y-2">
                    {selected.diseases.map((disease, i) => (
                      <div key={i} className="p-3 rounded-lg border bg-background hover:bg-muted/30 transition">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{disease.name}</span>
                          <Badge className={`${categoryColors[disease.category] || "bg-gray-100"} text-[9px]`}>{disease.category}</Badge>
                          <Badge variant="outline" className="text-[9px] ml-auto">{disease.prevalence}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1">
                          <Zap className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                          <span><strong>Spine Connection:</strong> {disease.spineConnection}</span>
                        </p>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>

              {/* Ayurvedic Correlation */}
              <Card>
                <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection("ayurveda")}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <Leaf className="h-3.5 w-3.5 text-green-600" /> Ayurvedic Correlation
                    </CardTitle>
                    {expandedSections.has("ayurveda") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CardHeader>
                {expandedSections.has("ayurveda") && (
                  <CardContent className="space-y-3">
                    <p className="text-xs leading-relaxed">{selected.ayurvedicCorrelation}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Marma Points</p>
                        <div className="flex flex-wrap gap-1">
                          {selected.marmaPoints.map(m => (
                            <Badge key={m} className="bg-green-50 text-green-700 text-[10px]">{m}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Recommended Treatments</p>
                        <div className="flex flex-wrap gap-1">
                          {selected.treatments.map(t => (
                            <Badge key={t} className="bg-amber-50 text-amber-700 text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Integrative — Acupuncture + Yoga */}
              <Card>
                <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection("integrative")}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <Target className="h-3.5 w-3.5 text-blue-600" /> Integrative Therapy Points
                    </CardTitle>
                    {expandedSections.has("integrative") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </CardHeader>
                {expandedSections.has("integrative") && (
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Acupuncture Points</p>
                        <div className="flex flex-wrap gap-1">
                          {selected.acupuncturePoints.map(a => (
                            <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Yoga Asanas</p>
                        <div className="flex flex-wrap gap-1">
                          {selected.yogaAsanas.map(y => (
                            <Badge key={y} className="bg-indigo-50 text-indigo-700 text-[10px]">{y}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </>
          )}

          {/* Disease View — all diseases grouped by category */}
          {viewMode === "disease" && !selected && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">All Diseases by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(
                  allDiseases.reduce<Record<string, typeof allDiseases>>((acc, d) => {
                    (acc[d.category] = acc[d.category] || []).push(d);
                    return acc;
                  }, {})
                ).sort((a, b) => b[1].length - a[1].length).map(([category, diseases]) => (
                  <div key={category} className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${categoryColors[category] || "bg-gray-100"} text-[10px]`}>{category}</Badge>
                      <span className="text-[10px] text-muted-foreground">{diseases.length} conditions</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 ml-2">
                      {diseases.map((d, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedLevel(d.levelId)}
                          className="flex items-center gap-1 text-left text-xs p-1 rounded hover:bg-muted transition"
                        >
                          <ArrowRight className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                          <span>{d.name}</span>
                          <span className="text-[9px] text-muted-foreground ml-auto">{d.level}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Organ View */}
          {viewMode === "organ" && !selected && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Organs by Spinal Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dermatomeData.map(level => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedLevel(level.id)}
                      className="w-full flex items-start gap-2 text-left p-2 rounded-lg hover:bg-muted border transition"
                    >
                      <div className={`w-3 h-3 rounded-full ${level.color} shrink-0 mt-1`} />
                      <div className="flex-1">
                        <p className="font-medium text-xs">{level.level} — {level.region}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {level.organs.map(o => (
                            <Badge key={o} variant="secondary" className="text-[9px]">{o}</Badge>
                          ))}
                        </div>
                      </div>
                      <span className="text-[9px] text-muted-foreground">{level.diseases.length} diseases</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Reference Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> Quick Reference — Spine-Disease Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left p-2">Level</th>
                  <th className="text-left p-2">Key Organs</th>
                  <th className="text-left p-2">Top Diseases</th>
                  <th className="text-left p-2">Primary Treatment</th>
                </tr>
              </thead>
              <tbody>
                {dermatomeData.map(level => (
                  <tr
                    key={level.id}
                    className="border-b hover:bg-muted/30 cursor-pointer"
                    onClick={() => setSelectedLevel(level.id)}
                  >
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${level.color}`} />
                        <span className="font-bold">{level.level}</span>
                      </div>
                    </td>
                    <td className="p-2 max-w-[150px] truncate">{level.organs.slice(0, 3).join(", ")}</td>
                    <td className="p-2 max-w-[200px] truncate">{level.diseases.slice(0, 2).map(d => d.name).join(", ")}</td>
                    <td className="p-2">{level.treatments[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

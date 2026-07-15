-- Seed kidney + female-health disease pages with sectioned markdown content
WITH kidney AS (SELECT id FROM treatment_systems WHERE slug='kidney-problems'),
     female AS (SELECT id FROM treatment_systems WHERE slug='female-health-issues')
INSERT INTO public.health_conditions (
  slug, name, tagline, hero_title, hero_subtitle,
  is_published, sort_order, system_id,
  consult_banner_text, content_sections, related_medicines, faqs
) VALUES
(
  'uti', 'UTI (Urinary Tract Infection)',
  'Ayurvedic care for recurrent urinary tract infections.',
  'UTI — Causes, Symptoms & Ayurvedic Remedies',
  'Soothe burning urination, prevent recurrence, and rebalance your urinary system naturally.',
  true, 10, (SELECT id FROM kidney),
  'Talk to an Ayurveda Doctor',
  '[
    {"key":"overview","title":"Overview","body_markdown":"A urinary tract infection (UTI) occurs when bacteria — most commonly *E. coli* — enter the urethra and multiply in the bladder, ureters or kidneys.\n\nWomen are far more prone to UTIs than men due to a shorter urethra. While modern medicine relies on antibiotics, **Ayurveda views UTI as a Pitta–Kapha imbalance (Mutrakrichra)** and treats it with cooling, diuretic and antimicrobial herbs that also prevent recurrence.\n\nThis page explains the modern causes of UTI, classical Ayurvedic remedies, and when to consult a doctor."},
    {"key":"causes","title":"Causes","body_markdown":"### Modern Causes of UTI\n- **Bacterial entry** — *E. coli* from the gut is the leading culprit.\n- **Poor hygiene** — improper wiping technique or delayed bathroom breaks.\n- **Holding urine for long durations** — allows bacteria to multiply in the bladder.\n- **Weakened immunity** — diabetes, chronic illness or post-menopausal changes.\n- **Catheter use** — hospital-acquired UTIs in elderly or post-surgery patients.\n\n### Ayurvedic View — Mutrakrichra\nAggravated **Pitta** (heat) and **Vata** (dryness) disturb the urinary channels (*mutravaha srotas*), producing burning, urgency and incomplete voiding."},
    {"key":"symptoms","title":"Symptoms","body_markdown":"- Burning sensation while urinating (**dysuria**)\n- Frequent urge to urinate, even with little output\n- Cloudy, dark or strong-smelling urine\n- Pelvic pain or lower abdominal heaviness\n- Mild fever, chills, fatigue\n- Blood-tinged urine in severe infections (consult a doctor immediately)"},
    {"key":"remedies","title":"Ayurvedic Remedies","body_markdown":"### Do-Ayurveda Home Remedies\n- **Coriander water** — boil 1 tsp coriander seeds in 2 cups water, strain, sip through the day. Cools Pitta.\n- **Barley water (Yava kwath)** — natural diuretic that flushes bacteria.\n- **Coconut water** — alkalises urine and reduces burning.\n- **Cucumber + ash gourd juice** — cooling and hydrating.\n\n### Classical Herbs\n- **Punarnava** *(Boerhavia diffusa)* — diuretic and anti-inflammatory.\n- **Gokshura** *(Tribulus terrestris)* — soothes burning, supports kidney health.\n- **Chandanasava** — classical decoction for *mutrakrichra*.\n- **Varun** *(Crataeva nurvala)* — clears urinary stones and infection.\n\n### Lifestyle\n- Drink 3–4 litres of water daily.\n- Avoid spicy, fried, fermented foods.\n- Wear cotton, loose innerwear; never hold urine."}
  ]'::jsonb,
  '[
    {"name":"Vrida Isabol","price":189,"url":"/shop"},
    {"name":"Vrida Gokshura","price":225,"url":"/shop"},
    {"name":"Vrida Chandanasava","price":265,"url":"/shop"}
  ]'::jsonb,
  '[
    {"q":"Can I treat UTI with Ayurveda alone?","a":"Mild, early-stage UTIs respond well to Ayurvedic herbs and dietary changes. Severe infections with fever or blood in urine need urgent medical evaluation."},
    {"q":"How long does Ayurvedic UTI treatment take?","a":"Symptoms ease within 3–5 days; a full 4–6 week course is recommended to prevent recurrence."},
    {"q":"Can men get UTI?","a":"Yes, though less common. Men over 50 with prostate issues are at higher risk."}
  ]'::jsonb
),
(
  'kidney-stones', 'Kidney Stones',
  'Dissolve and prevent kidney stones with classical Ayurvedic care.',
  'Kidney Stones — Causes, Symptoms & Ayurvedic Remedies',
  'Break down stones, reduce pain, and prevent recurrence using time-tested herbs.',
  true, 11, (SELECT id FROM kidney),
  'Talk to an Ayurveda Doctor',
  '[
    {"key":"overview","title":"Overview","body_markdown":"Kidney stones (*Ashmari* in Ayurveda) are hard mineral deposits that form when the urine becomes concentrated, allowing salts like calcium oxalate, uric acid or struvite to crystallise.\n\nSmall stones may pass on their own, but larger ones cause severe flank pain, blood in urine and infection. Ayurveda treats stones using **lithotriptic herbs** (*Ashmari-bhedan*) along with hydration and diet correction to prevent recurrence."},
    {"key":"causes","title":"Causes","body_markdown":"### Common Causes\n- **Dehydration** — concentrated urine is the #1 trigger.\n- **High-oxalate diet** — spinach, beetroot, nuts, chocolate in excess.\n- **High sodium / animal protein** — increases calcium excretion.\n- **Family history** — genetic predisposition.\n- **Recurrent UTIs** — promote struvite stone formation.\n- **Sedentary lifestyle and obesity.**\n\n### Ayurvedic View\nAggravated **Vata + Kapha** dries and hardens *mutra* (urine), forming stones in the *mutravaha srotas*."},
    {"key":"symptoms","title":"Symptoms","body_markdown":"- **Severe colicky pain** in flank, radiating to lower abdomen and groin\n- Blood in urine (**haematuria**)\n- Burning or painful urination\n- Frequent urge with small volumes\n- Nausea and vomiting\n- Fever and chills if infection sets in"},
    {"key":"remedies","title":"Ayurvedic Remedies","body_markdown":"### Classical Herbs\n- **Pashanabheda** *(Bergenia ligulata)* — literally *stone-breaker*; dissolves calcium stones.\n- **Varun** *(Crataeva nurvala)* — anti-lithic and diuretic.\n- **Gokshura** — flushes small stones, soothes urinary tract.\n- **Punarnava** — diuretic, reduces oedema.\n\n### Home Remedies\n- **Lemon + olive oil** — citrate prevents calcium binding.\n- **Coconut water + barley water** — hydrating diuretics.\n- **Horse-gram (kulthi) soup** — traditionally used to dissolve stones.\n- **Banana stem juice** — flushes stones, alkalises urine.\n\n### Diet Tips\n- Drink **3–4 L water/day** minimum.\n- Limit spinach, tomato seeds, red meat, salt.\n- Increase citrus fruits, cucumber, ash gourd.\n- Avoid excessive calcium supplements without doctor advice."}
  ]'::jsonb,
  '[
    {"name":"Vrida Pashanabheda","price":245,"url":"/shop"},
    {"name":"Vrida Varun","price":210,"url":"/shop"},
    {"name":"Cystone-style Tablet","price":189,"url":"/shop"}
  ]'::jsonb,
  '[
    {"q":"Can Ayurvedic medicine dissolve all kidney stones?","a":"Stones up to 6–8 mm respond well. Larger stones may need lithotripsy or surgery, after which Ayurveda helps prevent recurrence."},
    {"q":"How much water should a stone patient drink?","a":"At least 3 litres a day, more in summer or after exercise."}
  ]'::jsonb
),
(
  'kidney-failure', 'Kidney Failure',
  'Supportive Ayurvedic care for chronic kidney disease.',
  'Kidney Failure — Causes, Symptoms & Ayurvedic Support',
  'Slow disease progression, manage symptoms, and improve quality of life with classical Ayurveda.',
  true, 12, (SELECT id FROM kidney),
  'Talk to an Ayurveda Doctor',
  '[
    {"key":"overview","title":"Overview","body_markdown":"Kidney failure — acute or chronic — is the loss of the kidneys'' ability to filter waste, balance fluids and regulate electrolytes. **Chronic Kidney Disease (CKD)** progresses through 5 stages, ending in dialysis or transplant if uncontrolled.\n\nAyurveda cannot reverse end-stage kidney failure, but classical herbs and diet protocols (***Mutravaha srotas chikitsa***) have shown evidence in **slowing CKD progression**, reducing creatinine, and easing symptoms when used **alongside nephrology care** — never as a replacement for dialysis."},
    {"key":"causes","title":"Causes","body_markdown":"### Common Causes\n- **Diabetes** — leading cause of CKD globally.\n- **Hypertension** — damages kidney filters.\n- **Glomerulonephritis** — autoimmune inflammation.\n- **Polycystic kidney disease** — genetic.\n- **Long-term NSAID use** (painkillers).\n- **Recurrent kidney infections / obstruction.**\n\n### Ayurvedic View\nLong-standing **Pitta–Kapha** imbalance blocks the *mutravaha srotas*, leading to *ama* (toxin) accumulation in *rakta* (blood)."},
    {"key":"symptoms","title":"Symptoms","body_markdown":"- Swelling in feet, ankles, around eyes\n- Fatigue, weakness, breathlessness\n- Reduced urine output or frothy urine\n- Itching, dry skin\n- Loss of appetite, metallic taste, nausea\n- Difficulty sleeping, muscle cramps\n- Rising creatinine, urea on lab tests"},
    {"key":"remedies","title":"Ayurvedic Remedies","body_markdown":"### Supportive Herbs (under doctor supervision)\n- **Punarnava** *(Boerhavia diffusa)* — diuretic, reduces oedema, studied for nephroprotection.\n- **Gokshura** — supports renal function.\n- **Varun, Palasha** — clear *srotas* obstruction.\n- **Chandraprabha Vati** — classical formulation for urinary disorders.\n\n### Diet & Lifestyle\n- **Low-sodium, low-potassium, controlled-protein** diet — coordinate with your nephrologist.\n- Avoid bananas, oranges, tomatoes if potassium is high.\n- Manage diabetes and BP strictly.\n- Avoid NSAIDs, contrast dyes, herbal supplements without doctor approval.\n\n> ⚠️ **Important:** Never stop dialysis or prescribed nephrology medication. Use Ayurveda as integrative support only."}
  ]'::jsonb,
  '[
    {"name":"Vrida Punarnava","price":199,"url":"/shop"},
    {"name":"Chandraprabha Vati","price":175,"url":"/shop"},
    {"name":"Vrida Renal Support","price":349,"url":"/shop"}
  ]'::jsonb,
  '[
    {"q":"Can Ayurveda cure kidney failure?","a":"Ayurveda cannot reverse end-stage kidney disease, but it can slow CKD progression in early-to-moderate stages and reduce symptoms when used with conventional care."},
    {"q":"Is it safe to take Ayurvedic herbs with dialysis?","a":"Only under guidance of both your nephrologist and an Ayurvedic doctor. Some herbs affect potassium and fluid balance."}
  ]'::jsonb
),
(
  'fibroids', 'Fibroids (Uterine Fibroids)',
  'Shrink fibroids and ease heavy periods with classical Ayurveda.',
  'Fibroids — Causes, Symptoms & Ayurvedic Remedies',
  'Hormonal balance, herbal therapy and diet correction for non-surgical fibroid care.',
  true, 20, (SELECT id FROM female),
  'Talk to an Ayurveda Doctor',
  '[
    {"key":"overview","title":"Overview","body_markdown":"Uterine fibroids (*Granthi / Arbuda* in Ayurveda) are non-cancerous growths of muscle tissue in or on the uterus. They affect up to **70% of women by age 50**, often without symptoms — but can cause heavy bleeding, pelvic pain and fertility issues.\n\nAyurveda views fibroids as a **Kapha–Vata–Rakta** imbalance, where stagnant *rasa* and *rakta dhatu* form a *granthi* (lump). Treatment uses **lekhana** (scraping) and **sroto-shodhana** (channel-cleansing) herbs to gradually reduce fibroid size, alongside hormone-balancing rasayanas."},
    {"key":"causes","title":"Causes","body_markdown":"### Modern Causes\n- **Estrogen dominance** — fibroids grow in high-estrogen environments.\n- **Genetics** — family history doubles risk.\n- **Obesity** — fat tissue produces extra estrogen.\n- **Early menarche** or late menopause.\n- **Vitamin D deficiency.**\n- **Diet high in red meat, low in green vegetables.**\n\n### Ayurvedic View\nVitiated **Kapha** with stagnant **Rakta** in the *artava-vaha srotas* (reproductive channels) forms the *granthi*."},
    {"key":"symptoms","title":"Symptoms","body_markdown":"- **Heavy or prolonged menstrual bleeding** (menorrhagia)\n- Pelvic pressure or fullness\n- Frequent urination from bladder pressure\n- Constipation from rectal pressure\n- Pain during intercourse\n- Lower-back ache\n- Difficulty conceiving / recurrent miscarriage\n- Iron-deficiency anaemia from blood loss"},
    {"key":"remedies","title":"Ayurvedic Remedies","body_markdown":"### Classical Herbs\n- **Kanchanara Guggulu** — gold-standard for *granthi/arbuda*; helps shrink fibroids.\n- **Ashoka** *(Saraca indica)* — uterine tonic, controls heavy bleeding.\n- **Shatavari** — hormonal balance, ovarian support.\n- **Varuna, Trikatu** — clear *srotas*, reduce Kapha.\n- **Lodhra** — astringent, reduces menorrhagia.\n\n### Lifestyle & Diet\n- Reduce dairy, red meat, refined sugar, soy.\n- Increase **cruciferous veg** (broccoli, cabbage) — supports estrogen detox.\n- Daily exercise + yoga (*Bhujangasana, Setu Bandhasana*).\n- Manage stress — high cortisol worsens estrogen dominance.\n\n### When to See a Doctor\nFibroids >5 cm, severe anaemia, or fertility plans → discuss surgical options (myomectomy) alongside Ayurveda."}
  ]'::jsonb,
  '[
    {"name":"Kanchanara Guggulu","price":265,"url":"/shop"},
    {"name":"Vrida Ashokarishta","price":225,"url":"/shop"},
    {"name":"Vrida Shatavari","price":299,"url":"/shop"}
  ]'::jsonb,
  '[
    {"q":"Can Ayurveda shrink fibroids without surgery?","a":"Small to medium fibroids (under 5 cm) often respond to 4–6 months of Ayurvedic treatment with diet correction. Larger fibroids may need integrated care."},
    {"q":"Will fibroids affect my pregnancy?","a":"Most women with fibroids have normal pregnancies. Submucosal fibroids may need treatment before conception."}
  ]'::jsonb
),
(
  'pcod-pcos', 'PCOD / PCOS',
  'Restore hormonal balance and regular cycles naturally.',
  'PCOD / PCOS — Causes, Symptoms & Ayurvedic Remedies',
  'Reverse insulin resistance, regulate periods, and manage weight, acne and hair-fall holistically.',
  true, 21, (SELECT id FROM female),
  'Talk to an Ayurveda Doctor',
  '[
    {"key":"overview","title":"Overview","body_markdown":"**PCOD (Polycystic Ovarian Disease)** and **PCOS (Polycystic Ovarian Syndrome)** are hormonal disorders in which the ovaries produce immature or partially mature eggs that turn into cysts. PCOS is the more severe metabolic form, linked with **insulin resistance**, weight gain and infertility.\n\nAyurveda classifies it under ***Aartava-kshaya*** with a strong **Kapha–Medas (fat tissue)** imbalance. Treatment focuses on resetting metabolism, clearing *srotas* obstruction in the reproductive channels, and rebuilding *artava dhatu* (ovum)."},
    {"key":"causes","title":"Causes","body_markdown":"### Common Causes\n- **Insulin resistance** — drives excess androgen (male hormone) production.\n- **Genetic predisposition.**\n- **Sedentary lifestyle + processed-carb diet.**\n- **Chronic stress** — elevated cortisol disrupts ovulation.\n- **Obesity** — even 5–10% weight loss can restore cycles.\n\n### Ayurvedic View\n*Kapha* and *Medas* block the *artava-vaha srotas*, while disturbed *Vata* prevents proper ovum release."},
    {"key":"symptoms","title":"Symptoms","body_markdown":"- Irregular, delayed or missed periods\n- Heavy or prolonged bleeding when periods come\n- Acne, oily skin, dark patches (acanthosis nigricans)\n- Excess facial / body hair (hirsutism)\n- Hair-fall on the scalp (male-pattern)\n- Weight gain, especially around the abdomen\n- Difficulty conceiving\n- Mood swings, anxiety, depression\n- Multiple small cysts on ovary ultrasound"},
    {"key":"remedies","title":"Ayurvedic Remedies","body_markdown":"### Classical Herbs\n- **Shatavari** — primary female reproductive tonic.\n- **Ashoka, Lodhra** — regulate cycles.\n- **Kanchanara Guggulu** — clears cysts and Kapha-Medas obstruction.\n- **Triphala + Trikatu** — improves digestion, insulin sensitivity.\n- **Aloe vera juice** — supports ovulation.\n\n### Lifestyle (most important)\n- **Daily 45-min brisk walk or yoga** — non-negotiable.\n- Yoga: *Surya Namaskar, Baddha Konasana, Malasana, Kapalabhati pranayama.*\n- **Low-glycaemic diet** — millets, legumes, vegetables; cut sugar, maida, soft drinks.\n- Sleep by 10:30 PM — disturbed sleep worsens insulin resistance.\n- Manage stress with meditation.\n\n### Expected Timeline\nMost women see cycle regulation in **3–6 months** with consistent treatment + lifestyle change."}
  ]'::jsonb,
  '[
    {"name":"Vrida Shatavari","price":299,"url":"/shop"},
    {"name":"Kanchanara Guggulu","price":265,"url":"/shop"},
    {"name":"Vrida M2-Tone","price":215,"url":"/shop"}
  ]'::jsonb,
  '[
    {"q":"Difference between PCOD and PCOS?","a":"PCOD is a milder ovarian dysfunction. PCOS is a metabolic syndrome with insulin resistance, higher androgens, and greater infertility risk."},
    {"q":"Can PCOS be cured permanently?","a":"PCOS is managed, not cured. With sustained Ayurvedic treatment, diet and exercise, symptoms can go into long-term remission."},
    {"q":"Can I conceive with PCOS?","a":"Yes — many women conceive after restoring ovulation through Ayurveda + lifestyle. Severe cases may need integrated fertility care."}
  ]'::jsonb
),
(
  'menstrual-problems', 'Menstrual Problems',
  'Painful, irregular or heavy periods — natural balance through Ayurveda.',
  'Menstrual Problems — Causes, Symptoms & Ayurvedic Remedies',
  'Address dysmenorrhoea, irregular cycles, PMS, and heavy bleeding with herbs and dosha-balancing care.',
  true, 22, (SELECT id FROM female),
  'Talk to an Ayurveda Doctor',
  '[
    {"key":"overview","title":"Overview","body_markdown":"Menstrual problems include painful periods (**dysmenorrhoea**), irregular cycles (**oligo/amenorrhoea**), heavy bleeding (**menorrhagia**), and severe PMS. They affect over **80% of women** at some point.\n\nAyurveda groups these under ***Artava Vyapad*** and treats them by identifying the dominant *dosha*: **Vata** (painful, scanty, irregular), **Pitta** (heavy, bright red, with heat), or **Kapha** (delayed, mucousy, with weight gain)."},
    {"key":"causes","title":"Causes","body_markdown":"### Common Causes\n- **Hormonal imbalance** — thyroid, prolactin, PCOS.\n- **Stress and poor sleep.**\n- **Excessive exercise or sudden weight loss.**\n- **Nutritional deficiency** — iron, B12, vitamin D.\n- **Uterine pathology** — fibroids, endometriosis, adenomyosis.\n- **Cold, stale or junk food** — disturbs *Agni* and *Apana Vata*.\n\n### Ayurvedic View\nDisturbed *Apana Vata* (downward-moving energy) is the root of most menstrual disorders, often with Pitta-Kapha involvement."},
    {"key":"symptoms","title":"Symptoms","body_markdown":"### Pain Patterns\n- Cramping in lower abdomen, back, thighs\n- Pain starting 1–2 days before period (PMS) or only on day 1\n\n### Cycle Patterns\n- Cycles shorter than 21 days or longer than 35 days\n- Skipped periods\n- Heavy flow needing pad change every 1–2 hours\n- Clots larger than a 10p coin\n\n### Other\n- Mood swings, breast tenderness, bloating\n- Headache, nausea, fatigue\n- Acne flare-up before period"},
    {"key":"remedies","title":"Ayurvedic Remedies","body_markdown":"### For Painful Periods (Vata)\n- **Hingvashtaka churna** with warm water before meals.\n- **Castor oil massage** on lower abdomen.\n- **Warm compress** + ginger-jaggery tea.\n\n### For Heavy Periods (Pitta)\n- **Ashokarishta** — uterine tonic, controls bleeding.\n- **Lodhra, Praval Pishti** — astringent, cooling.\n- Avoid spicy, sour, fermented food during cycle.\n\n### For Irregular Cycles (Kapha / hormonal)\n- **Shatavari + Kumari (aloe)** — restore cyclicity.\n- **Kanchanara Guggulu** if PCOS-related.\n- Daily exercise to mobilise Kapha.\n\n### Lifestyle\n- Sleep 7–8 hrs, ideally by 10:30 PM.\n- Avoid cold drinks, stale food during periods.\n- Yoga: *Supta Baddha Konasana, Balasana, Viparita Karani.*\n- Track cycles with an app — share with your doctor."}
  ]'::jsonb,
  '[
    {"name":"Vrida Ashokarishta","price":225,"url":"/shop"},
    {"name":"Vrida M2-Tone","price":215,"url":"/shop"},
    {"name":"Hingvashtaka Churna","price":165,"url":"/shop"}
  ]'::jsonb,
  '[
    {"q":"How long does Ayurvedic treatment for menstrual issues take?","a":"Cycle correction typically takes 3 menstrual cycles (about 3 months) of consistent treatment."},
    {"q":"When should I worry about heavy bleeding?","a":"Soaking through a pad every hour for several hours, large clots, or bleeding longer than 7 days needs urgent gynaecology evaluation alongside Ayurveda."}
  ]'::jsonb
),
(
  'endometriosis', 'Endometriosis',
  'Manage endometriosis pain and infertility with classical Ayurveda.',
  'Endometriosis — Causes, Symptoms & Ayurvedic Remedies',
  'Reduce pelvic pain, control bleeding and improve fertility with herbs and lifestyle therapy.',
  true, 23, (SELECT id FROM female),
  'Talk to an Ayurveda Doctor',
  '[
    {"key":"overview","title":"Overview","body_markdown":"Endometriosis is a condition where tissue similar to the uterine lining grows outside the uterus — on ovaries, fallopian tubes or pelvic walls — causing severe pain, heavy bleeding and infertility.\n\nAyurveda correlates this with ***Vata-Pitta pradoshaja Artava Vyapad***, where misdirected *Apana Vata* carries *artava* (menstrual blood) into the wrong channels. Treatment combines anti-inflammatory, hormone-balancing and *srotas*-cleansing herbs."},
    {"key":"causes","title":"Causes","body_markdown":"### Likely Causes\n- **Retrograde menstruation** — back-flow of menstrual blood through fallopian tubes.\n- **Genetic predisposition.**\n- **Immune dysfunction** — body fails to clear ectopic tissue.\n- **High estrogen exposure.**\n- **Inflammation and oxidative stress.**\n\n### Ayurvedic View\n*Apana Vata* dysfunction with vitiated Pitta produces ectopic *artava* deposits and chronic inflammation."},
    {"key":"symptoms","title":"Symptoms","body_markdown":"- **Severe period pain** that disrupts daily life\n- Pain during or after intercourse\n- Pain during bowel movement / urination, especially during periods\n- Heavy or prolonged periods\n- Spotting between cycles\n- **Infertility** — endometriosis is found in 30–50% of women with unexplained infertility\n- Chronic fatigue, bloating, nausea"},
    {"key":"remedies","title":"Ayurvedic Remedies","body_markdown":"### Classical Herbs\n- **Kanchanara Guggulu** — reduces ectopic growths.\n- **Ashokarishta, Lodhra** — controls heavy bleeding.\n- **Shatavari, Guduchi** — immuno-modulators, hormone balance.\n- **Triphala + Aloe** — internal *srotas*-shodhana.\n- **Dashamoola kashaya** — anti-inflammatory, pain relief.\n\n### Lifestyle\n- **Anti-inflammatory diet** — turmeric, ginger, omega-3, leafy greens; avoid red meat, sugar, dairy excess.\n- Yoga: gentle poses, *Yoga Nidra* for pain modulation.\n- Warm sesame-oil abdominal massage (***Basti chikitsa*** in clinic).\n- Stress management — chronic pain worsens with anxiety.\n\n> Endometriosis is a long-term condition. Ayurveda + gynaecology co-management gives the best outcomes."}
  ]'::jsonb,
  '[
    {"name":"Kanchanara Guggulu","price":265,"url":"/shop"},
    {"name":"Vrida Ashokarishta","price":225,"url":"/shop"},
    {"name":"Vrida Shatavari","price":299,"url":"/shop"}
  ]'::jsonb,
  '[
    {"q":"Can Ayurveda cure endometriosis?","a":"Endometriosis is chronic. Ayurveda can significantly reduce pain, control bleeding and improve fertility, though laparoscopy may still be needed in severe cases."},
    {"q":"Will endometriosis go away after menopause?","a":"Symptoms often improve after menopause as estrogen falls, but Ayurvedic care during reproductive years prevents complications."}
  ]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  content_sections = EXCLUDED.content_sections,
  related_medicines = EXCLUDED.related_medicines,
  faqs = EXCLUDED.faqs,
  tagline = EXCLUDED.tagline,
  hero_title = EXCLUDED.hero_title,
  hero_subtitle = EXCLUDED.hero_subtitle,
  system_id = EXCLUDED.system_id,
  consult_banner_text = EXCLUDED.consult_banner_text,
  is_published = true,
  updated_at = now();
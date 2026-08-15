-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Dr. Joe Dispenza Meditation Tools — SEED DATA
-- Complete instructions, step-by-step guidance, and spine-healing integration
-- Run AFTER create_dispenza_meditation_tables.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TOOL 1: BREATH WORK (Pulling Mind Out of Body)                               ║
-- ║ Core Technique: Rhythmic breath to move energy up the spine                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO dispenza_meditation_tools (
  tool_number, title, subtitle, description, category,
  duration_minutes, difficulty_level,
  preparation_steps, main_steps, post_meditation_steps,
  contraindications, best_time_of_day,
  spine_relevance, target_spinal_regions, pairs_with_modules, dosha_affinity,
  icon_name, color_class, for_role, is_premium, sort_order, tags
) VALUES (
  1,
  'Breath Work (Spinal Energy)',
  'Pulling the Mind Out of the Body',
  'A powerful rhythmic breathing technique that pulls energy from the lower energy centers up through the spine to the brain. This activates the cerebrospinal fluid flow, stimulates the pineal gland, and creates a piezoelectric effect on the spinal column crystals. Directly beneficial for spinal healing as it increases blood flow and neural conductivity along the vertebral column.',
  'breathwork',
  25, 'intermediate',
  -- Preparation Steps
  '[
    {"step": 1, "instruction": "Find a quiet space. Sit upright on a chair with feet flat on the floor, or cross-legged on a cushion.", "duration_seconds": 60},
    {"step": 2, "instruction": "Close your eyes. Place your attention on your body sitting in space.", "duration_seconds": 30},
    {"step": 3, "instruction": "Take 3 slow, deep breaths to settle. Exhale completely each time.", "duration_seconds": 45},
    {"step": 4, "instruction": "Set your intention: I am pulling my mind out of my body to heal my spine.", "duration_seconds": 20}
  ]',
  -- Main Steps
  '[
    {"step": 1, "instruction": "Squeeze your perineum (root lock / Mula Bandha) and contract your lower abdomen inward.", "duration_seconds": 5, "note": "This locks the energy at the base of your spine."},
    {"step": 2, "instruction": "While holding the squeeze, take a sharp breath IN through the nose — pull the breath up your spine like pulling energy through a straw.", "duration_seconds": 4, "note": "Imagine energy rising from sacrum → lumbar → thoracic → cervical → brain."},
    {"step": 3, "instruction": "Hold the breath at the top of your head. Squeeze all internal muscles upward. Hold for 5-10 seconds.", "duration_seconds": 10, "note": "This creates pressure that pushes cerebrospinal fluid up to the pineal gland."},
    {"step": 4, "instruction": "Release and exhale slowly through the mouth. Relax all muscles completely.", "duration_seconds": 8, "note": "Feel the tingling or warmth along your spine."},
    {"step": 5, "instruction": "Rest for one normal breath cycle.", "duration_seconds": 6},
    {"step": 6, "instruction": "Repeat this cycle 7-8 times. Each time, squeeze harder and pull the breath higher.", "duration_seconds": 240, "note": "Total: about 4 minutes of active breathing."},
    {"step": 7, "instruction": "After the last breath, sit still with eyes closed. Place attention on the space around your body. Stay in this open awareness for 10-15 minutes.", "duration_seconds": 900, "note": "This is where healing happens — the body reorganizes itself."}
  ]',
  -- Post Meditation
  '[
    {"step": 1, "instruction": "Slowly bring awareness back to your body. Feel your spine from tailbone to skull.", "duration_seconds": 30},
    {"step": 2, "instruction": "Wiggle fingers and toes. Open your eyes gently.", "duration_seconds": 20},
    {"step": 3, "instruction": "Note any sensations in your spine — tingling, warmth, lightness, or energy movement.", "duration_seconds": 30},
    {"step": 4, "instruction": "Log your session: pain level before/after, energy sensations, depth of meditation.", "duration_seconds": 60}
  ]',
  ARRAY['Uncontrolled high blood pressure', 'Recent spinal surgery (within 6 weeks)', 'Epilepsy', 'Pregnancy (first trimester)'],
  'morning',
  'Directly moves cerebrospinal fluid along the spinal column. The breath creates a hydraulic pump effect that nourishes intervertebral discs and activates spinal nerve roots. The squeeze-and-breathe technique strengthens core stabilizers.',
  ARRAY['sacral', 'lumbar', 'thoracic', 'cervical'],
  ARRAY[1, 7, 8, 9],
  'vata',
  'Wind', 'blue', ARRAY['doctor', 'patient'], false, 1,
  ARRAY['breathwork', 'spinal_energy', 'csf_flow', 'pineal', 'core']
)
ON CONFLICT (tool_number) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  preparation_steps = EXCLUDED.preparation_steps, main_steps = EXCLUDED.main_steps,
  post_meditation_steps = EXCLUDED.post_meditation_steps, updated_at = NOW();

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TOOL 2: BODY PART BLESSING MEDITATION                                        ║
-- ║ Core Technique: Healing attention on specific body parts / spinal segments   ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO dispenza_meditation_tools (
  tool_number, title, subtitle, description, category,
  duration_minutes, difficulty_level,
  preparation_steps, main_steps, post_meditation_steps,
  contraindications, best_time_of_day,
  spine_relevance, target_spinal_regions, pairs_with_modules, dosha_affinity,
  icon_name, color_class, for_role, is_premium, sort_order, tags
) VALUES (
  2,
  'Body Part Blessing',
  'Healing Attention on Spinal Segments',
  'In this meditation, you place focused loving attention on each part of your body — specifically your spinal segments. Research shows that where you place your attention, energy flows. By blessing each vertebral level with gratitude and healing intention, you activate the autonomic nervous system''s repair mode. This technique is especially powerful post-treatment when tissues are in active healing.',
  'body_healing',
  30, 'beginner',
  -- Preparation Steps
  '[
    {"step": 1, "instruction": "Lie down comfortably on your back (Shavasana) or sit upright. Spine should be neutral.", "duration_seconds": 30},
    {"step": 2, "instruction": "Close your eyes. Take 5 deep breaths — inhale for 4 counts, exhale for 6 counts.", "duration_seconds": 60},
    {"step": 3, "instruction": "Feel gratitude for your body. Thank it for carrying you through life.", "duration_seconds": 30},
    {"step": 4, "instruction": "Set intention: I am sending healing energy to every part of my spine.", "duration_seconds": 20}
  ]',
  -- Main Steps
  '[
    {"step": 1, "instruction": "Place your attention on the TOP of your head (crown). Bless this area. Say internally: Thank you for my brain, my thoughts, my awareness. Feel love and gratitude here for 60 seconds.", "duration_seconds": 60, "body_part": "crown"},
    {"step": 2, "instruction": "Move attention to your CERVICAL SPINE (neck — C1 to C7). Bless each vertebra. Say: Thank you for supporting my head, for allowing me to turn and look at life. Send warmth here.", "duration_seconds": 90, "body_part": "cervical_spine"},
    {"step": 3, "instruction": "Move to your THORACIC SPINE (upper & mid back — T1 to T12). Bless this area. Say: Thank you for protecting my heart and lungs, for giving me the strength to stand tall.", "duration_seconds": 90, "body_part": "thoracic_spine"},
    {"step": 4, "instruction": "Move to your LUMBAR SPINE (lower back — L1 to L5). Bless this area. Say: Thank you for bearing my weight, for allowing me to bend and move freely. I send you healing energy.", "duration_seconds": 90, "body_part": "lumbar_spine"},
    {"step": 5, "instruction": "Move to your SACRUM and COCCYX. Bless this foundation. Say: Thank you for being my root, my stability, my connection to earth.", "duration_seconds": 60, "body_part": "sacrum"},
    {"step": 6, "instruction": "Now bless your ENTIRE SPINE as one unit. Visualize golden healing light flowing from sacrum to skull, filling every disc, every nerve, every muscle.", "duration_seconds": 120, "body_part": "full_spine"},
    {"step": 7, "instruction": "Bless your HANDS and ARMS (the healers). Bless your HEART (the source of love). Bless your LEGS (your foundation).", "duration_seconds": 120, "body_part": "extremities"},
    {"step": 8, "instruction": "Now bless the SPACE around your body — the energy field. Expand your awareness outward. Feel yourself bigger than your body.", "duration_seconds": 180, "body_part": "energy_field"},
    {"step": 9, "instruction": "Rest in this expanded feeling of gratitude and wholeness for 5 minutes. No effort. Just be.", "duration_seconds": 300, "body_part": "integration"}
  ]',
  -- Post Meditation
  '[
    {"step": 1, "instruction": "Slowly bring attention back to your physical body. Feel the surface beneath you.", "duration_seconds": 30},
    {"step": 2, "instruction": "Move fingers, toes, gently rock head side to side.", "duration_seconds": 20},
    {"step": 3, "instruction": "Notice: Has the quality of sensation in your spine changed? More warmth? Less tension?", "duration_seconds": 30},
    {"step": 4, "instruction": "Open eyes. Sit up slowly. Drink water. Record your experience.", "duration_seconds": 60}
  ]',
  ARRAY['Acute psychiatric episodes', 'Severe dissociative disorders'],
  'both',
  'Directly targets each spinal segment with focused healing attention. The autonomic nervous system responds to focused attention by increasing blood flow and reducing inflammation in the attended area. Perfect post-Panchakarma or post-adjustment meditation.',
  ARRAY['cervical', 'thoracic', 'lumbar', 'sacral'],
  ARRAY[2, 3, 4, 8, 9, 10],
  'tridosha',
  'Heart', 'pink', ARRAY['doctor', 'patient'], false, 2,
  ARRAY['body_blessing', 'gratitude', 'spinal_healing', 'autonomic', 'relaxation']
)
ON CONFLICT (tool_number) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  preparation_steps = EXCLUDED.preparation_steps, main_steps = EXCLUDED.main_steps,
  post_meditation_steps = EXCLUDED.post_meditation_steps, updated_at = NOW();

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TOOL 3: SPACE-TIME MEDITATION (Open Focus)                                    ║
-- ║ Core Technique: Dissolve pain by becoming aware of space around body         ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO dispenza_meditation_tools (
  tool_number, title, subtitle, description, category,
  duration_minutes, difficulty_level,
  preparation_steps, main_steps, post_meditation_steps,
  contraindications, best_time_of_day,
  spine_relevance, target_spinal_regions, pairs_with_modules, dosha_affinity,
  icon_name, color_class, for_role, is_premium, sort_order, tags
) VALUES (
  3,
  'Space-Time (Open Focus)',
  'Dissolving Pain Through Expanded Awareness',
  'This meditation shifts your awareness from the narrow focus on pain/body to the vast space around you. When you become aware of space (nothing, no-thing), your brain waves shift from high-beta (stress/pain) to alpha/theta (healing/regeneration). Chronic spine patients often have a narrow focus locked onto their pain. This technique breaks that pattern and allows the nervous system to reset.',
  'open_focus',
  20, 'beginner',
  -- Preparation Steps
  '[
    {"step": 1, "instruction": "Sit comfortably. Spine upright but relaxed. Hands on thighs, palms up.", "duration_seconds": 30},
    {"step": 2, "instruction": "Close eyes. Take 3 slow breaths. With each exhale, let go of tension.", "duration_seconds": 45},
    {"step": 3, "instruction": "Acknowledge any pain or discomfort in your spine without judgment. Just notice it.", "duration_seconds": 30}
  ]',
  -- Main Steps
  '[
    {"step": 1, "instruction": "Become aware of the SPACE between your eyes. Not your eyes — the space between them. Can you sense that empty space?", "duration_seconds": 30, "note": "This shifts brain from object-focus to space-focus."},
    {"step": 2, "instruction": "Now sense the SPACE behind your eyes — the space your brain occupies inside your skull. Just notice the volume of space.", "duration_seconds": 45},
    {"step": 3, "instruction": "Expand awareness to the SPACE around your entire head. The space above, beside, behind your head.", "duration_seconds": 45},
    {"step": 4, "instruction": "Now sense the SPACE around your neck and cervical spine. The space that surrounds your vertebrae.", "duration_seconds": 45},
    {"step": 5, "instruction": "Expand to the SPACE around your entire torso — the space your thoracic spine occupies. The space around your ribs, lungs, heart.", "duration_seconds": 60},
    {"step": 6, "instruction": "Sense the SPACE around your lower back — the space your lumbar spine lives in. The space around your pelvis.", "duration_seconds": 60},
    {"step": 7, "instruction": "Now become aware of the ENTIRE SPACE your body occupies in the room. Your whole body floating in space.", "duration_seconds": 60},
    {"step": 8, "instruction": "Expand further — sense the space of the entire room. You are aware of the room without opening your eyes.", "duration_seconds": 60},
    {"step": 9, "instruction": "Expand to the space beyond the room — the building, the area, the city... keep expanding.", "duration_seconds": 60},
    {"step": 10, "instruction": "Now just REST in infinite space. You are no body, no thing, no where, in no time. Just awareness in space. Stay here for 10 minutes.", "duration_seconds": 600, "note": "This is where alpha/theta brain waves activate healing. Dont try to do anything."}
  ]',
  -- Post Meditation
  '[
    {"step": 1, "instruction": "Slowly bring awareness back — from infinite space back to the room, back to your body.", "duration_seconds": 45},
    {"step": 2, "instruction": "Notice your spine now. Has the sensation of pain or tightness changed? Often it reduces or disappears.", "duration_seconds": 30},
    {"step": 3, "instruction": "Wiggle fingers, take a deep breath, open eyes.", "duration_seconds": 20},
    {"step": 4, "instruction": "Record: Pain before vs after. Any sensations of expansion or lightness.", "duration_seconds": 60}
  ]',
  ARRAY['Active psychosis', 'Severe anxiety disorder (start with shorter sessions)'],
  'anytime',
  'Chronic spine pain creates a narrow-focus brain pattern (high beta waves) that amplifies pain signals. Open Focus meditation breaks this cycle by shifting to alpha/theta waves, reducing pain perception by 40-60% in studies. The expanded awareness also reduces muscle guarding and spasm.',
  ARRAY['cervical', 'thoracic', 'lumbar'],
  ARRAY[1, 6, 7],
  'vata',
  'Maximize', 'indigo', ARRAY['doctor', 'patient'], false, 3,
  ARRAY['open_focus', 'space', 'pain_relief', 'alpha_waves', 'awareness']
)
ON CONFLICT (tool_number) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  preparation_steps = EXCLUDED.preparation_steps, main_steps = EXCLUDED.main_steps,
  post_meditation_steps = EXCLUDED.post_meditation_steps, updated_at = NOW();

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TOOL 4: WALKING MEDITATION (Posture Rehearsal)                                ║
-- ║ Core Technique: Mentally rehearse new posture before physical practice       ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO dispenza_meditation_tools (
  tool_number, title, subtitle, description, category,
  duration_minutes, difficulty_level,
  preparation_steps, main_steps, post_meditation_steps,
  contraindications, best_time_of_day,
  spine_relevance, target_spinal_regions, pairs_with_modules, dosha_affinity,
  icon_name, color_class, for_role, is_premium, sort_order, tags
) VALUES (
  4,
  'Walking Meditation',
  'Posture Rehearsal & Mindful Movement',
  'Combines Dispenza''s mental rehearsal with actual walking. The patient first mentally rehearses perfect spinal alignment, then walks slowly with full awareness of each spinal segment. This creates new neural pathways for correct posture. Research shows mental rehearsal activates the same motor cortex regions as physical movement — so you''re literally rewiring your brain for better posture.',
  'movement',
  20, 'beginner',
  -- Preparation Steps
  '[
    {"step": 1, "instruction": "Stand with feet hip-width apart. Close your eyes. Feel your spine stacked: sacrum → lumbar → thoracic → cervical → skull.", "duration_seconds": 30},
    {"step": 2, "instruction": "MENTAL REHEARSAL: Before walking, visualize yourself walking with perfect posture. See your spine tall, shoulders relaxed, head balanced. Watch this movie of yourself for 2 minutes.", "duration_seconds": 120},
    {"step": 3, "instruction": "Feel what it would feel like to walk with this perfect alignment. Generate the FEELING of confidence, grace, and freedom in your body NOW — before you take a step.", "duration_seconds": 60}
  ]',
  -- Main Steps
  '[
    {"step": 1, "instruction": "Open your eyes softly (half-lidded gaze, looking 3 meters ahead on the ground). Begin walking VERY slowly.", "duration_seconds": 30, "note": "Speed: about 1 step per 3 seconds."},
    {"step": 2, "instruction": "HEEL STRIKE: Notice your heel touching the ground. Feel the shock absorption through your ankle, knee, hip, up to your spine.", "duration_seconds": 60, "note": "Awareness of ground reaction force and spinal response."},
    {"step": 3, "instruction": "MID-STANCE: Feel your weight transfer over the foot. Is your pelvis level? Is your lumbar curve maintained?", "duration_seconds": 60},
    {"step": 4, "instruction": "TOE-OFF: Push off with your toes. Feel the activation of your glutes and core. Your spine stays tall.", "duration_seconds": 60},
    {"step": 5, "instruction": "ARM SWING: Notice if your arms swing naturally. Opposite arm to opposite leg. Shoulders relaxed, not hiked.", "duration_seconds": 60},
    {"step": 6, "instruction": "HEAD POSITION: Is your head balanced over your spine? Chin slightly tucked? Not forward?", "duration_seconds": 60},
    {"step": 7, "instruction": "Continue walking for 10 minutes with this full awareness. If your mind wanders, gently bring it back to the FEELING of perfect alignment.", "duration_seconds": 600, "note": "Walk in a quiet space — a room, hallway, or garden path."},
    {"step": 8, "instruction": "For the last 2 minutes, gradually increase speed to normal walking pace while maintaining awareness.", "duration_seconds": 120}
  ]',
  -- Post Meditation
  '[
    {"step": 1, "instruction": "Stop walking. Stand still. Close your eyes. Feel your spine in this new alignment.", "duration_seconds": 30},
    {"step": 2, "instruction": "Notice: Does standing tall feel more natural now? Has your habitual posture shifted?", "duration_seconds": 30},
    {"step": 3, "instruction": "Set intention: I will carry this awareness into my regular walking today.", "duration_seconds": 20},
    {"step": 4, "instruction": "Record: Posture awareness level (1-10), any corrections noticed, gait quality.", "duration_seconds": 60}
  ]',
  ARRAY['Severe balance disorders (do seated version)', 'Acute lower limb injury', 'Vertigo'],
  'morning',
  'Directly retrains the motor cortex for correct spinal alignment during gait. Mental rehearsal + slow walking creates permanent neural pathway changes. Pairs perfectly with corrective exercise modules for Upper/Lower Cross Syndrome.',
  ARRAY['lumbar', 'thoracic', 'cervical'],
  ARRAY[5, 6, 7, 8, 9, 11],
  'kapha',
  'Footprints', 'green', ARRAY['doctor', 'patient'], false, 4,
  ARRAY['walking', 'posture', 'gait', 'neuroplasticity', 'movement', 'motor_cortex']
)
ON CONFLICT (tool_number) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  preparation_steps = EXCLUDED.preparation_steps, main_steps = EXCLUDED.main_steps,
  post_meditation_steps = EXCLUDED.post_meditation_steps, updated_at = NOW();

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TOOL 5: PINEAL GLAND ACTIVATION (Kaleidoscope)                                ║
-- ║ Core Technique: Activate the pineal gland for neurochemical healing          ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO dispenza_meditation_tools (
  tool_number, title, subtitle, description, category,
  duration_minutes, difficulty_level,
  preparation_steps, main_steps, post_meditation_steps,
  contraindications, best_time_of_day,
  spine_relevance, target_spinal_regions, pairs_with_modules, dosha_affinity,
  icon_name, color_class, for_role, is_premium, sort_order, tags
) VALUES (
  5,
  'Pineal Gland Activation',
  'Kaleidoscope & Inner Vision',
  'The pineal gland sits at the geometric center of the brain and produces melatonin, DMT, and other neurochemicals that promote deep healing and regeneration. This meditation uses the breath technique to push energy to the pineal, then focuses attention on the space behind the forehead (third eye / Ajna chakra) to activate inner vision. Patients often see colors, geometric patterns (kaleidoscope), or experience profound states of peace. These neurochemicals are powerful anti-inflammatory agents for spinal healing.',
  'pineal_activation',
  35, 'advanced',
  -- Preparation Steps
  '[
    {"step": 1, "instruction": "Sit upright in complete darkness or use a sleep mask. The pineal gland responds to absence of light.", "duration_seconds": 30},
    {"step": 2, "instruction": "Close eyes. Rest tongue on the roof of your mouth (Khechari Mudra position).", "duration_seconds": 15},
    {"step": 3, "instruction": "Take 5 slow breaths. With each exhale, release all tension. Let your body become very still.", "duration_seconds": 75},
    {"step": 4, "instruction": "Set intention: I am activating my pineal gland to release healing chemistry into my body.", "duration_seconds": 20}
  ]',
  -- Main Steps
  '[
    {"step": 1, "instruction": "Perform 3 rounds of the Spinal Breath (Tool 1): Squeeze perineum, inhale sharply pulling energy up spine, hold at crown, release. 3 rounds.", "duration_seconds": 120, "note": "This primes the cerebrospinal fluid to reach the pineal."},
    {"step": 2, "instruction": "After the 3rd breath, keep your attention locked on the space BEHIND your forehead — the center of your brain. Converge your closed eyes slightly upward toward this point.", "duration_seconds": 30, "note": "This is the location of the pineal gland / Ajna chakra."},
    {"step": 3, "instruction": "With eyes still closed and looking up-and-inward, perform slow rhythmic breathing: Inhale 4 counts, hold 4 counts, exhale 4 counts. Keep attention on the pineal point.", "duration_seconds": 240, "note": "You may start seeing colors — purple, indigo, gold, white. This is normal."},
    {"step": 4, "instruction": "If you see patterns, colors, or a kaleidoscope effect — follow it. Dont analyze. Just observe. This is your pineal gland producing neurochemistry.", "duration_seconds": 300, "note": "These visuals indicate activation. Stay relaxed and observant."},
    {"step": 5, "instruction": "Now let go of any technique. Surrender completely. Let whatever is happening in your inner space unfold. Stay in this state for 15 minutes.", "duration_seconds": 900, "note": "Deep healing state. Anti-inflammatory neurochemicals are flooding your body."},
    {"step": 6, "instruction": "If at any point you feel overwhelming bliss, warmth spreading through your body, or your spine tingling — this is the healing response. Stay with it.", "duration_seconds": 120, "note": "The neurochemicals produced are natural anti-inflammatories and tissue regenerators."}
  ]',
  -- Post Meditation
  '[
    {"step": 1, "instruction": "Very slowly bring awareness back. Do NOT rush. You may feel deeply relaxed or altered.", "duration_seconds": 60},
    {"step": 2, "instruction": "Feel your spine. Notice any warmth, tingling, or pulsing along the vertebral column.", "duration_seconds": 30},
    {"step": 3, "instruction": "Gently open eyes. Stay seated for 2 minutes before standing.", "duration_seconds": 120},
    {"step": 4, "instruction": "Drink water. Record: Colors seen, body sensations, depth of experience, spine changes.", "duration_seconds": 60}
  ]',
  ARRAY['Epilepsy', 'Bipolar disorder (manic phase)', 'Recent head trauma', 'Psychotic disorders', 'Under 16 years old'],
  'evening',
  'Pineal activation releases powerful anti-inflammatory and regenerative neurochemicals (melatonin metabolites, DMT precursors) that reduce spinal inflammation, promote disc hydration, and support nerve regeneration. The CSF pump mechanism also directly nourishes spinal structures.',
  ARRAY['cervical', 'cranio-cervical_junction'],
  ARRAY[1, 8],
  'pitta',
  'Sparkles', 'purple', ARRAY['doctor', 'patient'], true, 5,
  ARRAY['pineal', 'kaleidoscope', 'neurochemistry', 'anti_inflammatory', 'advanced', 'third_eye']
)
ON CONFLICT (tool_number) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  preparation_steps = EXCLUDED.preparation_steps, main_steps = EXCLUDED.main_steps,
  post_meditation_steps = EXCLUDED.post_meditation_steps, updated_at = NOW();

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TOOL 6: MORNING & EVENING MEDITATION SCHEDULER                                ║
-- ║ Core Technique: Structured AM/PM practice with progressive protocols         ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO dispenza_meditation_tools (
  tool_number, title, subtitle, description, category,
  duration_minutes, difficulty_level,
  preparation_steps, main_steps, post_meditation_steps,
  contraindications, best_time_of_day,
  spine_relevance, target_spinal_regions, pairs_with_modules, dosha_affinity,
  icon_name, color_class, for_role, is_premium, sort_order, tags
) VALUES (
  6,
  'Meditation Scheduler',
  'Morning & Evening Protocol Planning',
  'A structured scheduling system that assigns specific meditations to morning and evening slots based on the patient''s spinal condition, recovery stage, and progress level. Morning meditations are energizing (breathwork, mental rehearsal) while evening meditations are restorative (body blessing, open focus). The scheduler adapts weekly based on compliance and progress scores.',
  'scheduling',
  5, 'beginner',
  -- Preparation Steps (This is a planning tool, not a meditation itself)
  '[
    {"step": 1, "instruction": "Review your current spinal condition and recovery stage with your doctor.", "duration_seconds": 0},
    {"step": 2, "instruction": "Choose your wake-up time and bedtime to determine meditation windows.", "duration_seconds": 0},
    {"step": 3, "instruction": "Select your preferred meditation space (quiet room, garden, clinic).", "duration_seconds": 0}
  ]',
  -- Main Steps (Scheduling Protocol)
  '[
    {"step": 1, "instruction": "WEEK 1-2 (Foundation): Morning = Open Focus (15 min). Evening = Body Blessing (20 min). Goal: Establish habit.", "week": "1-2", "note": "Start gentle. Build consistency before intensity."},
    {"step": 2, "instruction": "WEEK 3-4 (Building): Morning = Breathwork (20 min). Evening = Body Blessing (25 min). Goal: Activate spinal energy.", "week": "3-4", "note": "Add breath technique once sitting habit is solid."},
    {"step": 3, "instruction": "WEEK 5-6 (Deepening): Morning = Breathwork + Mental Rehearsal (30 min). Evening = Open Focus + Journal (25 min). Goal: Neuroplasticity.", "week": "5-6", "note": "Combine techniques for deeper rewiring."},
    {"step": 4, "instruction": "WEEK 7-8 (Advanced): Morning = Pineal Activation (35 min). Evening = Body Blessing + Walking (30 min). Goal: Deep healing chemistry.", "week": "7-8", "note": "Only advance if consistent for 6 weeks."},
    {"step": 5, "instruction": "MAINTENANCE: Choose any 2 meditations daily based on what your body needs. Listen to your spine.", "week": "9+", "note": "By now you know what works best for you."}
  ]',
  -- Post Steps (Compliance Tips)
  '[
    {"step": 1, "instruction": "Set phone reminders for your meditation times. Non-negotiable appointments with yourself.", "duration_seconds": 0},
    {"step": 2, "instruction": "Track daily in the app: Done/Skipped. Aim for 80% compliance minimum.", "duration_seconds": 0},
    {"step": 3, "instruction": "Review weekly: Which meditation gave best results? Adjust schedule accordingly.", "duration_seconds": 0},
    {"step": 4, "instruction": "Share progress with your doctor at follow-up visits. They may adjust your protocol.", "duration_seconds": 0}
  ]',
  ARRAY[]::TEXT[],
  'both',
  'Consistent daily meditation practice has cumulative healing effects on the spine. AM sessions prime the nervous system for better posture throughout the day. PM sessions activate repair mode during sleep. The 8-week progressive structure mirrors typical spinal rehabilitation timelines.',
  ARRAY['full_spine'],
  ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  'tridosha',
  'CalendarClock', 'orange', ARRAY['doctor', 'patient'], false, 6,
  ARRAY['schedule', 'routine', 'habit', 'compliance', 'progressive', 'planning']
)
ON CONFLICT (tool_number) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  preparation_steps = EXCLUDED.preparation_steps, main_steps = EXCLUDED.main_steps,
  post_meditation_steps = EXCLUDED.post_meditation_steps, updated_at = NOW();

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TOOL 7: ELEVATED EMOTION JOURNAL                                              ║
-- ║ Core Technique: Daily gratitude + emotion logging for healing amplification  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO dispenza_meditation_tools (
  tool_number, title, subtitle, description, category,
  duration_minutes, difficulty_level,
  preparation_steps, main_steps, post_meditation_steps,
  contraindications, best_time_of_day,
  spine_relevance, target_spinal_regions, pairs_with_modules, dosha_affinity,
  icon_name, color_class, for_role, is_premium, sort_order, tags
) VALUES (
  7,
  'Elevated Emotion Journal',
  'Gratitude, Love & Joy for Healing',
  'Dr. Dispenza''s research shows that elevated emotions (gratitude, love, joy, inspiration) create coherent heart rhythms that signal genes for healing and repair. This journal tool guides patients to cultivate and record these emotions daily. When paired with meditation, elevated emotions amplify the healing effect by 300%. The journal also tracks correlations between emotional states and spine pain levels over time.',
  'journaling',
  10, 'beginner',
  -- Preparation Steps
  '[
    {"step": 1, "instruction": "Find a quiet moment — ideally right after your morning or evening meditation.", "duration_seconds": 30},
    {"step": 2, "instruction": "Have your journal (digital or paper) ready. Take 3 deep breaths.", "duration_seconds": 30},
    {"step": 3, "instruction": "Close your eyes briefly. Remember: Gratitude is the ULTIMATE state of receiving.", "duration_seconds": 20}
  ]',
  -- Main Steps (Journaling Prompts)
  '[
    {"step": 1, "instruction": "GRATITUDE (write 3 things): What are 3 things you are genuinely grateful for RIGHT NOW? Feel the gratitude in your heart as you write each one. Not just think it — FEEL it.", "duration_seconds": 120, "category": "gratitude"},
    {"step": 2, "instruction": "LOVE (write 1-2 things): Who or what do you love deeply? A person, a pet, nature, your life? Write it and generate the feeling of love in your chest.", "duration_seconds": 90, "category": "love"},
    {"step": 3, "instruction": "JOY (write 1 thing): What brought you joy recently — even small? A smile, sunshine, a meal, a song? Relive that moment as you write.", "duration_seconds": 60, "category": "joy"},
    {"step": 4, "instruction": "SPINE CHECK: Rate your spine pain right now (0-10). Rate your mobility feeling (restricted / normal / free / expanded).", "duration_seconds": 30, "category": "spine"},
    {"step": 5, "instruction": "HEALING INTENTION: Write one sentence about your healed future self. Example: My spine is strong, flexible, and pain-free. I move with grace and confidence.", "duration_seconds": 60, "category": "intention"},
    {"step": 6, "instruction": "SYNCHRONICITIES: Did anything surprising or meaningful happen since your last entry? Note it. These increase as coherence grows.", "duration_seconds": 60, "category": "synchronicity"},
    {"step": 7, "instruction": "Close with: I am grateful for my healing. Thank you, body. Thank you, spine.", "duration_seconds": 30, "category": "closing"}
  ]',
  -- Post Steps
  '[
    {"step": 1, "instruction": "Read back what you wrote. Let the feelings linger.", "duration_seconds": 30},
    {"step": 2, "instruction": "Notice: After writing, is your mood elevated? Do you feel lighter? More hopeful?", "duration_seconds": 20},
    {"step": 3, "instruction": "Carry one of these elevated emotions with you through your day.", "duration_seconds": 10}
  ]',
  ARRAY[]::TEXT[],
  'both',
  'Elevated emotions (measured as heart-brain coherence) directly reduce cortisol and inflammatory cytokines that damage spinal tissues. Patients who journal gratitude daily show 23% faster recovery from spinal procedures and significantly lower pain medication usage.',
  ARRAY['full_spine'],
  ARRAY[1, 7],
  'pitta',
  'BookHeart', 'rose', ARRAY['doctor', 'patient'], false, 7,
  ARRAY['journal', 'gratitude', 'emotions', 'heart_coherence', 'healing', 'daily_practice']
)
ON CONFLICT (tool_number) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  preparation_steps = EXCLUDED.preparation_steps, main_steps = EXCLUDED.main_steps,
  post_meditation_steps = EXCLUDED.post_meditation_steps, updated_at = NOW();

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TOOL 8: COHERENCE HEALING (Group Intention)                                   ║
-- ║ Core Technique: Group meditation for collective healing amplification        ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO dispenza_meditation_tools (
  tool_number, title, subtitle, description, category,
  duration_minutes, difficulty_level,
  preparation_steps, main_steps, post_meditation_steps,
  contraindications, best_time_of_day,
  spine_relevance, target_spinal_regions, pairs_with_modules, dosha_affinity,
  icon_name, color_class, for_role, is_premium, sort_order, tags
) VALUES (
  8,
  'Coherence Healing (Group)',
  'Collective Intention for Amplified Healing',
  'Based on Dr. Dispenza''s Project Coherence research where groups of meditators direct healing intention toward a single person, resulting in documented remissions and recoveries. In the clinic setting, this can be organized as weekly group sessions where patients and staff meditate together, directing healing intention toward each participant''s spine. The coherent field amplifies individual healing potential exponentially.',
  'group_healing',
  45, 'intermediate',
  -- Preparation Steps
  '[
    {"step": 1, "instruction": "GROUP SETUP: Gather in a circle (in-person or online video). Each person sits comfortably with spine upright.", "duration_seconds": 60},
    {"step": 2, "instruction": "FACILITATOR introduces: Today we heal together. Each persons intention amplifies everyone elses healing.", "duration_seconds": 30},
    {"step": 3, "instruction": "Each participant briefly shares their healing intention (one sentence): e.g., My L4-L5 disc is regenerating fully.", "duration_seconds": 180, "note": "With 10 people, this takes about 3 minutes."},
    {"step": 4, "instruction": "Everyone closes eyes. Take 5 synchronized breaths together (facilitator counts).", "duration_seconds": 60}
  ]',
  -- Main Steps
  '[
    {"step": 1, "instruction": "PHASE 1 — INDIVIDUAL COHERENCE (5 min): Each person does the heart-focused breathing. Breathe in gratitude, breathe out love. Build your own coherent field first.", "duration_seconds": 300, "note": "You must be coherent yourself before you can heal others."},
    {"step": 2, "instruction": "PHASE 2 — EXPAND YOUR FIELD (3 min): Expand your heart energy outward to fill the room. Feel your energy connecting with everyone elses.", "duration_seconds": 180, "note": "Imagine a golden web of light connecting all hearts."},
    {"step": 3, "instruction": "PHASE 3 — DIRECTED HEALING (15 min): Facilitator names each person one by one. When your name is called, receive. Everyone else: send love and healing intention to that person spine.", "duration_seconds": 900, "note": "Send energy specifically to their stated spinal condition."},
    {"step": 4, "instruction": "PHASE 4 — COLLECTIVE FIELD (10 min): Now direct the combined intention to ALL spines in the group simultaneously. Visualize every spine in the room glowing with health.", "duration_seconds": 600, "note": "The group field is now coherent — this is where miracles happen."},
    {"step": 5, "instruction": "PHASE 5 — SILENT INTEGRATION (5 min): Release all intention. Sit in silence. Let the healing energy integrate. Trust the intelligence of the field.", "duration_seconds": 300}
  ]',
  -- Post Steps
  '[
    {"step": 1, "instruction": "Facilitator gently brings group back. Everyone takes 3 deep breaths together.", "duration_seconds": 45},
    {"step": 2, "instruction": "SHARING ROUND: Each person shares one sensation or experience. Did you feel heat? Tingling? Emotion?", "duration_seconds": 300},
    {"step": 3, "instruction": "Record group coherence score (facilitator rates 1-100 based on group focus and reports).", "duration_seconds": 30},
    {"step": 4, "instruction": "Schedule next session. Consistency amplifies results week over week.", "duration_seconds": 30}
  ]',
  ARRAY['People who are actively hostile or unwilling', 'Cannot be forced — voluntary participation only'],
  'evening',
  'Group coherence creates a measurable electromagnetic field that promotes tissue healing. In Dispenza retreats, participants with spinal conditions have shown measurable disc rehydration and reduced stenosis after consistent group sessions. The social support component also reduces isolation-driven pain amplification.',
  ARRAY['full_spine'],
  ARRAY[7, 10],
  'kapha',
  'Users', 'amber', ARRAY['doctor', 'patient'], false, 8,
  ARRAY['group', 'coherence', 'collective', 'healing_circle', 'community', 'amplification']
)
ON CONFLICT (tool_number) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  preparation_steps = EXCLUDED.preparation_steps, main_steps = EXCLUDED.main_steps,
  post_meditation_steps = EXCLUDED.post_meditation_steps, updated_at = NOW();

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TOOL 9: MENTAL REHEARSAL (Future Self Visualization)                          ║
-- ║ Core Technique: Neuroplasticity tool — rehearse healed state                 ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO dispenza_meditation_tools (
  tool_number, title, subtitle, description, category,
  duration_minutes, difficulty_level,
  preparation_steps, main_steps, post_meditation_steps,
  contraindications, best_time_of_day,
  spine_relevance, target_spinal_regions, pairs_with_modules, dosha_affinity,
  icon_name, color_class, for_role, is_premium, sort_order, tags
) VALUES (
  9,
  'Mental Rehearsal (Future Self)',
  'Visualize Your Healed Spine & New Life',
  'The most powerful neuroplasticity tool in Dispenza''s system. You mentally rehearse being your future healed self — moving freely, standing tall, living without pain. Neuroscience confirms that the brain cannot distinguish between a real experience and a vividly imagined one. By repeatedly rehearsing your healed state, you install the neurological hardware BEFORE the body changes. This is the same mechanism elite athletes use for performance — applied to spinal healing.',
  'visualization',
  25, 'intermediate',
  -- Preparation Steps
  '[
    {"step": 1, "instruction": "Sit or lie comfortably. Close eyes. Do 2 minutes of slow breathing to calm the mind.", "duration_seconds": 120},
    {"step": 2, "instruction": "Recall your current condition: What does your spine feel like now? What cant you do? Acknowledge it without judgment.", "duration_seconds": 30},
    {"step": 3, "instruction": "Now DECIDE: I am going to create a new experience for my body. My future self is already healed.", "duration_seconds": 20},
    {"step": 4, "instruction": "Generate the EMOTION of already being healed — relief, joy, freedom, gratitude. Feel it NOW, before the visualization.", "duration_seconds": 60}
  ]',
  -- Main Steps
  '[
    {"step": 1, "instruction": "SEE your future self waking up in the morning. Your spine feels light, strong, pain-free. You stretch with ease — reaching, twisting, bending. Visualize this in vivid detail.", "duration_seconds": 120, "scene": "morning"},
    {"step": 2, "instruction": "SEE yourself standing in front of a mirror. Your posture is tall, balanced, confident. Shoulders back, head centered. You LOOK healthy. Feel pride and gratitude.", "duration_seconds": 90, "scene": "mirror"},
    {"step": 3, "instruction": "SEE yourself MOVING through your day — walking, sitting at work, playing with family, exercising. Your spine supports every movement flawlessly. No guarding. No fear.", "duration_seconds": 120, "scene": "daily_life"},
    {"step": 4, "instruction": "SEE yourself doing something you CANT do now because of your spine. Lifting your child. Playing sports. Dancing. Traveling. Make it specific and personal.", "duration_seconds": 120, "scene": "achievement"},
    {"step": 5, "instruction": "SEE your doctor''s face as they review your scan — they say: Remarkable improvement. Your discs look healthier. Your alignment is excellent. Feel the joy.", "duration_seconds": 90, "scene": "medical_confirmation"},
    {"step": 6, "instruction": "Now BECOME this future self. Step INTO the movie. You ARE this person now. Feel the freedom in your spine. The strength. The gratitude. EMBODY it fully.", "duration_seconds": 180, "scene": "embodiment"},
    {"step": 7, "instruction": "Stay in this embodied state for 5-10 minutes. Let your body memorize this feeling. This is your new normal.", "duration_seconds": 600, "scene": "integration"}
  ]',
  -- Post Steps
  '[
    {"step": 1, "instruction": "Slowly return to present moment. Keep the FEELING of your future self alive in your body.", "duration_seconds": 30},
    {"step": 2, "instruction": "Tell yourself: This is who I am becoming. Every cell in my body is moving toward this reality.", "duration_seconds": 20},
    {"step": 3, "instruction": "Open eyes. Move with the posture and confidence of your future self TODAY.", "duration_seconds": 20},
    {"step": 4, "instruction": "Record: What did you visualize? How vivid was it (1-10)? What emotion was strongest? Spine sensation?", "duration_seconds": 60}
  ]',
  ARRAY['Severe depression without clinical support', 'Body dysmorphia (modify with therapist guidance)'],
  'morning',
  'Mental rehearsal of correct spinal movement creates motor cortex activation identical to physical practice. Patients who visualize daily show measurably faster progress in corrective exercise programs. The emotional component (feeling healed) downregulates pain pathways and reduces central sensitization.',
  ARRAY['full_spine'],
  ARRAY[5, 6, 7, 8, 9, 10, 11, 12, 13],
  'vata',
  'Brain', 'violet', ARRAY['doctor', 'patient'], false, 9,
  ARRAY['visualization', 'future_self', 'neuroplasticity', 'mental_rehearsal', 'motor_cortex', 'healing']
)
ON CONFLICT (tool_number) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  preparation_steps = EXCLUDED.preparation_steps, main_steps = EXCLUDED.main_steps,
  post_meditation_steps = EXCLUDED.post_meditation_steps, updated_at = NOW();

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TOOL 10: BRAIN-HEART COHERENCE SCORE                                          ║
-- ║ Core Technique: Track & display coherence metrics over time                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO dispenza_meditation_tools (
  tool_number, title, subtitle, description, category,
  duration_minutes, difficulty_level,
  preparation_steps, main_steps, post_meditation_steps,
  contraindications, best_time_of_day,
  spine_relevance, target_spinal_regions, pairs_with_modules, dosha_affinity,
  icon_name, color_class, for_role, is_premium, sort_order, tags
) VALUES (
  10,
  'Brain-Heart Coherence Score',
  'Track Your Healing Progress & Correlation',
  'A composite score (0-100) that measures the alignment between meditation consistency, emotional elevation, pain reduction, and spinal recovery outcomes. The score is calculated from: meditation streak (25%), average session depth (25%), pain trajectory (25%), and spine recovery correlation (25%). Displayed as a beautiful dashboard with trends, milestones, and correlation with physical therapy outcomes. This is the data layer that proves meditation is working.',
  'biometrics',
  5, 'beginner',
  -- How to Read Your Score
  '[
    {"step": 1, "instruction": "Your coherence score updates daily based on 4 factors:", "duration_seconds": 0},
    {"step": 2, "instruction": "CONSISTENCY (25%): How many days in a row have you meditated? 7-day streak = 70%, 30-day = 100%.", "duration_seconds": 0},
    {"step": 3, "instruction": "DEPTH (25%): Your average depth rating across sessions. 7+ out of 10 = excellent.", "duration_seconds": 0},
    {"step": 4, "instruction": "PAIN REDUCTION (25%): Are your pain-before vs pain-after scores improving week over week?", "duration_seconds": 0}
  ]',
  -- Score Interpretation
  '[
    {"step": 1, "instruction": "SCORE 0-25 (Red): Just starting. Focus on building daily habit. Any meditation is better than none.", "level": "beginner", "color": "red"},
    {"step": 2, "instruction": "SCORE 26-50 (Orange): Building momentum. Your body is starting to respond. Keep going — neuroplasticity takes 21+ days.", "level": "developing", "color": "orange"},
    {"step": 3, "instruction": "SCORE 51-75 (Yellow-Green): Strong practice. You should notice clear pain reduction and posture improvement. Your doctor will see changes.", "level": "established", "color": "green"},
    {"step": 4, "instruction": "SCORE 76-100 (Green-Gold): Mastery level. Your meditation is clearly correlating with spinal recovery. You are rewiring your brain and healing your body.", "level": "mastery", "color": "gold"},
    {"step": 5, "instruction": "CORRELATION CHART: The app shows a graph of your coherence score plotted against your Spine Recovery Score (from patient recovery module). When both lines rise together — thats proof.", "level": "correlation"}
  ]',
  -- How to Improve Your Score
  '[
    {"step": 1, "instruction": "Meditate EVERY day, even if only 10 minutes. Consistency > duration.", "duration_seconds": 0},
    {"step": 2, "instruction": "Log sessions honestly — depth, pain levels, emotions. The data drives your score.", "duration_seconds": 0},
    {"step": 3, "instruction": "Combine meditation with your corrective exercises for fastest spine recovery correlation.", "duration_seconds": 0},
    {"step": 4, "instruction": "Share your score with your doctor — they can adjust treatment based on your meditation progress.", "duration_seconds": 0}
  ]',
  ARRAY[]::TEXT[],
  'anytime',
  'Provides objective measurement linking meditation practice to spinal healing outcomes. Doctors can use the coherence score to adjust treatment intensity — highly coherent patients may need less aggressive interventions. Also motivates patients through gamification and visible progress.',
  ARRAY['full_spine'],
  ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  'tridosha',
  'Activity', 'emerald', ARRAY['doctor', 'patient'], false, 10,
  ARRAY['score', 'metrics', 'coherence', 'progress', 'correlation', 'gamification', 'dashboard']
)
ON CONFLICT (tool_number) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  preparation_steps = EXCLUDED.preparation_steps, main_steps = EXCLUDED.main_steps,
  post_meditation_steps = EXCLUDED.post_meditation_steps, updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — 10 Dispenza Meditation Tools Seeded:
-- 1. Breath Work (Spinal Energy)
-- 2. Body Part Blessing
-- 3. Space-Time (Open Focus)
-- 4. Walking Meditation
-- 5. Pineal Gland Activation
-- 6. Meditation Scheduler
-- 7. Elevated Emotion Journal
-- 8. Coherence Healing (Group)
-- 9. Mental Rehearsal (Future Self)
-- 10. Brain-Heart Coherence Score
-- ═══════════════════════════════════════════════════════════════════════════════

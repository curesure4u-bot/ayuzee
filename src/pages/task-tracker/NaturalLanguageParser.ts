import type { Priority, Importance, Urgency } from "./types";

type ParsedTask = {
  task_name: string;
  priority: Priority;
  due_date: string | null;
  person_in_charge: string;
  importance: Importance;
  urgency: Urgency;
};

/**
 * Natural Language Parser for task creation.
 * Parses strings like:
 * - "Call Ramesh tomorrow high priority"
 * - "Submit report by Friday urgent important"
 * - "Buy medicines for clinic low priority next week"
 * - "Follow up with patient assign to Priya due June 15"
 */
export function parseNaturalLanguage(input: string): ParsedTask {
  let text = input.trim();
  let priority: Priority = "Medium";
  let due_date: string | null = null;
  let person_in_charge = "";
  let importance: Importance = "Not Important";
  let urgency: Urgency = "Not Urgent";

  const today = new Date();

  // Extract priority
  const priorityPatterns: [RegExp, Priority][] = [
    [/\b(very high|critical|p1)\b/i, "Very High"],
    [/\b(high priority|high|important priority|p2)\b/i, "High"],
    [/\b(medium priority|medium|normal|p3)\b/i, "Medium"],
    [/\b(low priority|low|p4)\b/i, "Low"],
    [/\b(very low|lowest|p5)\b/i, "Very Low"],
    [/\b(on hold|hold|paused)\b/i, "On Hold"],
  ];
  for (const [pattern, p] of priorityPatterns) {
    if (pattern.test(text)) { priority = p; text = text.replace(pattern, "").trim(); break; }
  }

  // Extract urgency/importance
  if (/\burgent\b/i.test(text)) { urgency = "Urgent"; text = text.replace(/\burgent\b/i, "").trim(); }
  if (/\bimportant\b/i.test(text)) { importance = "Important"; text = text.replace(/\bimportant\b/i, "").trim(); }

  // Extract assignee ("assign to X", "for X", "give to X")
  const assignMatch = text.match(/\b(?:assign(?:ed)? to|for|give to|delegate to)\s+(\w+)/i);
  if (assignMatch) { person_in_charge = assignMatch[1]; text = text.replace(assignMatch[0], "").trim(); }

  // Extract date
  const datePatterns: [RegExp, () => Date][] = [
    [/\btoday\b/i, () => today],
    [/\btomorrow\b/i, () => { const d = new Date(today); d.setDate(d.getDate() + 1); return d; }],
    [/\bday after tomorrow\b/i, () => { const d = new Date(today); d.setDate(d.getDate() + 2); return d; }],
    [/\bnext week\b/i, () => { const d = new Date(today); d.setDate(d.getDate() + 7); return d; }],
    [/\bnext month\b/i, () => { const d = new Date(today); d.setMonth(d.getMonth() + 1); return d; }],
    [/\bthis friday\b/i, () => { const d = new Date(today); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7)); return d; }],
    [/\bthis monday\b/i, () => { const d = new Date(today); d.setDate(d.getDate() + ((1 - d.getDay() + 7) % 7 || 7)); return d; }],
    [/\bthis wednesday\b/i, () => { const d = new Date(today); d.setDate(d.getDate() + ((3 - d.getDay() + 7) % 7 || 7)); return d; }],
    [/\bin (\d+) days?\b/i, () => { const m = text.match(/in (\d+) days?/i); const d = new Date(today); d.setDate(d.getDate() + parseInt(m![1])); return d; }],
    [/\bin (\d+) weeks?\b/i, () => { const m = text.match(/in (\d+) weeks?/i); const d = new Date(today); d.setDate(d.getDate() + parseInt(m![1]) * 7); return d; }],
  ];

  for (const [pattern, getDate] of datePatterns) {
    if (pattern.test(text)) {
      const d = getDate();
      due_date = d.toISOString().split("T")[0];
      text = text.replace(pattern, "").trim();
      break;
    }
  }

  // Try explicit date format: "due June 15", "by 2025-06-15", "on 15/06"
  const explicitDate = text.match(/\b(?:due|by|on|before)\s+(\d{4}-\d{2}-\d{2}|\w+ \d{1,2}(?:,? \d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{4})?)\b/i);
  if (explicitDate && !due_date) {
    try {
      const parsed = new Date(explicitDate[1]);
      if (!isNaN(parsed.getTime())) {
        due_date = parsed.toISOString().split("T")[0];
        text = text.replace(explicitDate[0], "").trim();
      }
    } catch {}
  }

  // Clean up remaining text as task name
  const task_name = text.replace(/\s+/g, " ").replace(/^[-–—,.\s]+|[-–—,.\s]+$/g, "").trim() || input.trim();

  return { task_name, priority, due_date, person_in_charge, importance, urgency };
}
